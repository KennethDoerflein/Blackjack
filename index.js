document.getElementById("hitButton").onclick = hit;
// document.getElementById("standButton").onclick = stand;
// document.getElementById("newGameButton").onclick = newGame;

let deck = new CardDeck();
let dealersCards = [];
let dealerTotal = 0;
let playersCards = [];
let playerTotal = 0;
let playersDiv = document.getElementById("playersCards");
let dealersDiv = document.getElementById("dealersCards");

//console.log(deck.cards);
function calculateTotal(cards) {}
function addCard(player, cards, div) {
  cards.push(deck.getCard());
  let imgPath;
  if (player !== "dealer" || cards.length === 1) {
    imgPath = `./cards-1.3/${cards[cards.length - 1].image}`;
  } else {
    imgPath = "./cards-1.3/back.png";
  }
  div.innerHTML += '<img src="' + imgPath + '" >';
}

function hit(player) {
  if (player !== "dealer") {
    addCard(player, playersCards, playersDiv);
    playerTotal = calculateTotal(playersCards);
  } else {
    addCard(player, dealersCards, dealersDiv);
    dealerTotal = calculateTotal(dealersCards);
  }
}

function stand() {}
function checkStatus() {}
function newGame() {}
function initializeGame() {
  for (let i = 0; i < 2; i++) {
    hit();
    hit("dealer");
  }
  setTimeout(function () {
    document.getElementById("hitButton").removeAttribute("hidden");
  }, 50);
}
initializeGame();
