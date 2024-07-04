class Card {
  constructor(rank, suit, pointValue, image) {
    this.rank = rank;
    this.suit = suit;
    this.pointValue = pointValue;
    // https://code.google.com/archive/p/vector-playing-cards/
    this.image = image;
  }
}

class CardDeck {
  constructor() {
    this.RANKS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
    this.SUITS = ["spades", "hearts", "diamonds", "clubs"];
    this.POINT_VALUES = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

    this.cards = this.createDeck();
    this.shuffle();
  }

  createDeck() {
    let deck = [];

    for (let rank of this.RANKS) {
      for (let suit of this.SUITS) {
        let pointValue = this.POINT_VALUES[this.RANKS.indexOf(rank)];
        let image = `${rank}_of_${suit}.png`;
        deck.push(new Card(rank, suit, pointValue, image));
      }
    }
    return deck;
  }

  shuffle() {
    // Durstenfeld shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  newGame() {
    this.cards = this.createDeck();
    this.shuffle();
  }

  getCard() {
    if (this.cards.length === 0) {
      return null;
    }
    return this.cards.pop();
  }
}
