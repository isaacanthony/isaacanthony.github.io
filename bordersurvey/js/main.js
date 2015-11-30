var media = {};
media.data = [];
media.counter = 0;
media.next = function () {
  media.counter++;
  if (media.counter >= media.data.length) media.counter = 0;
  displayMedia(media.data[media.counter]);
};
media.prev = function () {
  media.counter--;
  if (media.counter < 0) media.counter = media.data.length - 1;
  displayMedia(media.data[media.counter]);
};
media.shuffle = function () {
  var o = media.data;
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
};

var county = {};
county.name = '';
county.media = [];
county.instruments = [];
county.artists = [];
county.years = [];

var seedDB = function () {
  county.media = ['All', 'Audio', 'Image', 'Video'];
  county.instruments = ['All', 'Banjo', 'Fiddle', 'Vocal'];
  county.artists = ['All', 'Sheila Kay Adams', 'Bobby McMillon'];
  county.years = ['All', '2013', '2014', '2015', '2016'];
};

var populateSelect = function (arr, id) {
  $(id).empty();
  $.each(arr, function(key, value) {
    $(id).append($('<option>', {
      value: value,
      text: value
    }));
  });
};

var displayMedia = function (m) {
  $('#media-title').html(m.title);
  $('#media-artist').html(m.artist);
  $('#media-year').html('(' + m.year + ')');
  $('#media-description').html(m.description);
  $('#media-content').empty();
  if (m.source === 'Youtube') {
    $('#media-content').append($('<iframe>', {
      'class': 'video-iframe',
      'src': 'http://www.youtube.com/embed/' + m.filename
    }));
  } else if (m.source === 'Soundcloud') {
    $('#media-content').append($('<iframe>', {
      'class': 'audio-iframe',
      'src': 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + m.filename
    }));
  }
};

var baseLayer  = L.tileLayer(
  'http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
  {attribution: '&copy Esri - National Geographic'}
);

var style = {
  'clickable': true,
  'color': '#00D',
  'fillColor': '#00D',
  'weight': 1.2,
  'opacity': 0.2,
  'fillOpacity': 0
};

var hoverStyle = {
  'fillOpacity': 0.3
};

// var geojsonURL = 'http://catalog.opendata.city/dataset/0ad555f2-91f7-4dfc-b262-aa8ff51295b3/resource/1507e892-a228-484c-a043-237aa43ffc0d/download/temp.geojson';
var geojsonURL = 'data/nc-counties.geojson';
var geojsonLayer = new L.TileLayer.GeoJSON(geojsonURL, {
  clipTiles: true,
  unique: function (feature) {
    return feature.properties.geoid; 
  }
}, {
  style: style,
  onEachFeature: function (feature, layer) { 
    if (!(layer instanceof L.Point)) {
      layer.on('mouseover', function () {
        layer.setStyle(hoverStyle);
        county.name = feature.properties.name;
        $('#county-name').html(feature.properties.name);
      });
      layer.on('mouseout', function () {
        layer.setStyle(style);
        $('#county-name').empty();
      });
      layer.on('click', function () {
        $('#modal-county-name').html(county.name);
        seedDB();
        populateSelect(county.media, '#media-select');
        populateSelect(county.instruments, '#instrument-select');
        populateSelect(county.artists, '#artist-select');
        populateSelect(county.years, '#year-select');

        media.data = $.grep(data, function(a, b) {return a.county === county.name});

        if (media.data.length === 0) {
          $('#media-title').html('No results found.');
          $('#nav-btns').addClass('disabled');
        } else {
          $('#nav-btns').removeClass('disabled');
          media.shuffle();
          displayMedia(media.data[0]);
        }

        $('#modal-view').modal('show');
      });
    }
  }
});

var map = new L.Map('map', {
  center: new L.LatLng(35.5, -80),
  zoom: 7,
  zoomControl: false,
  layers: [baseLayer, geojsonLayer]
});

// Disable drag and zoom handlers.
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();

// Disable tap handler, if present.
if (map.tap) map.tap.disable();

