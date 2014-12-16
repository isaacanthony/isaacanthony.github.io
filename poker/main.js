var $ = function (id) {
  var node = document.getElementById(id);
  return {
    clear: function () {
      node.innerHTML = '';
      return $(id);
    },
    html: function (str) {
      node.innerHTML += str;
      return $(id);
    },
    hasClass: function (str) {
      var arr = node.className.split(' ');
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === str) return true;
      }
      return false;
    },
    addClass: function (str) {
      node.className += ' ' + str;
      return $(id);
    },
    removeClass: function (str) {
      node.className = node.className.replace(str, '');
      return $(id);
    }
  }
};

var poker = {};

poker.model = {};

poker.model.config = {
  handID: 'hand',
  resultsID: 'results',
  coinsID: 'coins',
  buttonID: 'btn'
};

poker.model.state = {
  coins: 100,
  ante: 5,
  results: '&nbsp;',
  deck: {},
  hand: [],
  count: 0
};

poker.model.coins = {
  add: function (n) {
    poker.model.state.coins += n;
    poker.view.update.coins();
  },
  subtract: function (n) {
    poker.model.state.coins -= n;
    poker.view.update.coins();
  }
};

poker.model.deck = function () {
  var cards = ['2C','3C','4C','5C','6C','7C','8C','9C','0C','JC','QC','KC','AC',
               '2D','3D','4D','5D','6D','7D','8D','9D','0D','JD','QD','KD','AD',
               '2H','3H','4H','5H','6H','7H','8H','9H','0H','JH','QH','KH','AH',
               '2S','3S','4S','5S','6S','7S','8S','9S','0S','JS','QS','KS','AS'];
  var shuffle = function (o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), 
      x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };
  return {
    deal: function () {
      shuffle(cards);
      return cards.shift();
    }
  };
};

poker.model.card = {
  value: function (card) {
    return card[0];
  },
  suit: function (card) {
    return card[1];
  }
};

poker.model.hand = {

  isPair(h) {
    for (var i = 0; i < 4; i++) {
      if (poker.model.card.value(h[i]) === poker.model.card.value(h[i + 1]) &&
          poker.model.card.value(h[i]).match(/[JQKA]/)) return true;
    }
    return false;
  },

  isTwoPair(h) {
    if (poker.model.card.value(h[0]) === poker.model.card.value(h[1]) &&
       (poker.model.card.value(h[2]) === poker.model.card.value(h[3]) ||
        poker.model.card.value(h[3]) === poker.model.card.value(h[4]))) return true;
    if (poker.model.card.value(h[3]) === poker.model.card.value(h[4]) &&
        poker.model.card.value(h[1]) === poker.model.card.value(h[2])) return true;
    return false;
  },

  isThreeKind(h) {
    if (poker.model.card.value(h[0]) === poker.model.card.value(h[1]) &&
        poker.model.card.value(h[0]) === poker.model.card.value(h[2])) return true;
    if (poker.model.card.value(h[1]) === poker.model.card.value(h[2]) &&
        poker.model.card.value(h[1]) === poker.model.card.value(h[3])) return true;
    if (poker.model.card.value(h[2]) === poker.model.card.value(h[3]) &&
        poker.model.card.value(h[2]) === poker.model.card.value(h[4])) return true;
    return false;
  },

  isStraight(h) {
    var values = [];
    for (var i = 0; i < 5; i++) {
      var temp = poker.model.card.value(h[i]);
      switch (temp) {
        case '0': temp = 10; break;
        case 'J': temp = 11; break;
        case 'Q': temp = 12; break;
        case 'K': temp = 13; break;
        case 'A': temp = 1; break;
        default: temp = temp * 1; break;
      }
      values[i] = temp;
    }
    values = values.sort(function(a, b){return a-b;});
    if (values[0] === 1 && values[1] === 10 && values[2] === 11 &&
        values[3] === 12 && values[4] === 13) return true;
    for (var i = 0; i < 4; i++) {
      if (values[i] + 1 !== values[i + 1]) return false;
    }
    return true;
  },

  isFlush(h) {
    for (var i = 0; i < 4; i++) {
      if (poker.model.card.suit(h[i]) !== poker.model.card.suit(h[i + 1])) return false;
    }
    return true;
  },

  isFullHouse(h) {
    if (poker.model.card.value(h[0]) === poker.model.card.value(h[1]) &&
        poker.model.card.value(h[0]) === poker.model.card.value(h[2]) &&
        poker.model.card.value(h[3]) === poker.model.card.value(h[4])) return true;
    if (poker.model.card.value(h[4]) === poker.model.card.value(h[3]) &&
        poker.model.card.value(h[4]) === poker.model.card.value(h[2]) &&
        poker.model.card.value(h[1]) === poker.model.card.value(h[0])) return true;
    return false;
  },

  isFourKind(h) {
    if (poker.model.card.value(h[0]) === poker.model.card.value(h[1]) && 
        poker.model.card.value(h[0]) === poker.model.card.value(h[2]) &&
        poker.model.card.value(h[0]) === poker.model.card.value(h[3])) return true;
    if (poker.model.card.value(h[4]) === poker.model.card.value(h[1]) && 
        poker.model.card.value(h[4]) === poker.model.card.value(h[2]) &&
        poker.model.card.value(h[4]) === poker.model.card.value(h[3])) return true;
    return false;
  },

  isStraightFlush(h) {
    return poker.model.hand.isStraight(h) && poker.model.hand.isFlush(h);
  }

};

poker.model.getScore = function (hand) {
  var ante = poker.model.state.ante;
  if (poker.model.hand.isStraightFlush(hand)) return {text:'Straight Flush<br>(+250)',coins:250};
  if (poker.model.hand.isFourKind(hand)) return {text:'Four of a Kind<br>(+125)',coins:125};
  if (poker.model.hand.isFullHouse(hand)) return {text:'Full House<br>(+45)',coins:45};
  if (poker.model.hand.isFlush(hand)) return {text:'Flush<br>(+30)',coins:30};
  if (poker.model.hand.isStraight(hand)) return {text:'Straight<br>(+20)',coins:20};
  if (poker.model.hand.isThreeKind(hand)) return {text:'Three of a Kind<br>(+15)',coins:15};
  if (poker.model.hand.isTwoPair(hand)) return {text:'Two Pair<br>(+10)',coins:10};
  if (poker.model.hand.isPair(hand)) return {text:'Pair<br>(+5)',coins:5};
  return {text:'High Card<br>(+0)',coins:0};
};

poker.view = {};

poker.view.clear = {
  hand: function () {
    $(poker.gameSate.handID).clear();
  },
  coins: function () {
    $(poker.model.state.coinsID).clear();
  },
  results: function () {
    $(poker.model.config.resultsID).clear().html('&nbsp;');
  },
  all: function () {
    poker.view.clear.hand();
    poker.view.clear.coins();
    poker.view.clear.results();
  }
};

poker.view.update = {
  hand: function () {
    var hand = poker.model.state.hand;
    $(poker.model.config.handID).clear();
    for (var i = 0; i < 5; i++) {
      poker.view.printCard(hand[i]);
    }
  },
  coins: function () {
    $(poker.model.config.coinsID).clear().html('$' + poker.model.state.coins);
  },
  results: function () {
    $(poker.model.config.resultsID).clear().html(poker.model.state.results);
  },
};

poker.view.printCard = function (card) {
  if (! card) return;
  var cardText = card;
  var label = '';
  var ten = '';
  if (card[1] === 'D' || card[1] === 'H') label = 'red';
  if (card[0] === '0') {card = '10' + card[1]; ten = 'ten';}
  card = card.replace('C', '&clubs;').replace('D', '&diams;')
    .replace('H', '&hearts;').replace('S', '&spades;');
  $('hand').html('<div id="' + cardText + '" class="card ' + label + 
    ' ' + ten + '" onclick="poker.controller.discard(\'' + cardText + '\')">' + card + '</div>');
};

poker.view.gameOver = function () {
  poker.view.clear.all();
  poker.model.state.results = '<h2>Game Over</h2>';
  poker.view.update.results();
};

poker.view.button = {
  toDeal: function () {
    $(poker.model.config.buttonID).clear().html('Deal');
  },
  toDraw: function () {
    $(poker.model.config.buttonID).clear().html('Draw');
  }
};

poker.controller = {};

poker.controller.discard = function (card) {
  if ($(card).hasClass('discard')) {
    $(card).removeClass('discard');
  } else {
    $(card).addClass('discard');
  }
};

poker.controller.draw = function () {
  var hand = poker.model.state.hand;
  for (var i = 0; i < 5; i++) {
    if ($(hand[i]).hasClass('discard')) {
      hand[i] = poker.model.state.deck.deal();
    }
  }
  poker.view.update.hand();
  var score = poker.model.getScore(hand.sort());
  poker.model.state.results = score.text;
  poker.view.update.results();
  poker.model.coins.add(score.coins);
  poker.view.update.coins();
  poker.model.state.hand = hand;
};

poker.controller.deal = function () {
  poker.model.coins.subtract(poker.model.state.ante);
  poker.model.state.deck = new poker.model.deck();
  var hand = [];
  for (var i = 0; i < 5; i++) {
    hand[i] = poker.model.state.deck.deal();
  }
  poker.model.state.hand = hand;
  poker.view.update.hand();
};

poker.controller.main = function () {
  if (poker.model.state.count % 2 === 0) {
    poker.view.clear.results();
    if (poker.model.state.coins <= 0) return poker.view.gameOver();
    poker.controller.deal();
    poker.view.button.toDraw();
  } else {
    poker.controller.draw();
    poker.view.button.toDeal();
  }
  poker.model.state.count++;
};
