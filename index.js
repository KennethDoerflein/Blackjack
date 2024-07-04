const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");

const deck = new CardDeck();
let dealersCards;
let dealerTotal;
let playersCards;
let playerTotal;
const playersDiv = document.getElementById("playersCards");
const dealersDiv = document.getElementById("dealersCards");
const winnerDiv = document.getElementById("winner");
let gameStatus;

function endGame() {
  if (gameStatus === "inProgress") {
    gameStatus = "gameOver";
    playDealer();
    document.getElementById("hitBtn").toggleAttribute("hidden");
    document.getElementById("standBtn").toggleAttribute("hidden");
    document.getElementById("newGameBtn").toggleAttribute("hidden");

    hitBtn.removeEventListener("click", hit);
    standBtn.removeEventListener("click", endGame);
    newGameBtn.addEventListener("click", newGame);

    let dealerSecondCardImg = dealersDiv.getElementsByTagName("img")[1];
    dealerSecondCardImg.src = `./cards-1.3/${dealersCards[1].image}`;

    let winner = document.createElement("h3");
    if ((playerTotal > 21 || playerTotal < dealerTotal) && dealerTotal <= 21) {
      winner.textContent = "Dealer Wins";
    } else if ((dealerTotal > 21 && playerTotal <= 21) || playerTotal > dealerTotal) {
      winner.textContent = "You Win";
    } else {
      winner.textContent = "It's a Tie";
    }
    winnerDiv.appendChild(winner);
  }
}

function calculateTotal(cards) {
  //console.log(cards);
  let total = 0;
  let aces = 0;
  for (let i = 0; i < cards.length; i++) {
    total += cards[i].pointValue;
    if (cards[i].rank === "ace") {
      aces++;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  //console.log(total);
  return total;
}

function addCard(player, cards, div) {
  cards.push(deck.getCard());
  let imgPath;
  if (player !== "dealer" || cards.length === 1 || gameStatus !== "inProgress") {
    imgPath = `./cards-1.3/${cards[cards.length - 1].image}`;
  } else {
    imgPath = "./cards-1.3/back.png";
  }
  let img = document.createElement("img");
  img.src = imgPath;
  div.appendChild(img);
}

function hit(player) {
  if (player !== "dealer") {
    addCard(player, playersCards, playersDiv);
    playerTotal = calculateTotal(playersCards);
  } else {
    addCard(player, dealersCards, dealersDiv);
    dealerTotal = calculateTotal(dealersCards);
  }
  checkStatus();
}

function playDealer() {
  while (dealerTotal <= 16) {
    hit("dealer");
  }
}

function checkStatus() {
  if (playerTotal > 21 || dealerTotal > 21) {
    endGame();
  }
}

function newGame() {
  document.getElementById("newGameBtn").toggleAttribute("hidden");

  deck.newGame();
  initializeGame();
}

function initializeGame() {
  dealersCards = [];
  playersCards = [];
  dealerTotal = 0;
  playerTotal = 0;

  while (playersDiv.firstChild) {
    playersDiv.removeChild(playersDiv.firstChild);
  }
  while (dealersDiv.firstChild) {
    dealersDiv.removeChild(dealersDiv.firstChild);
  }
  while (winnerDiv.firstChild) {
    winnerDiv.removeChild(winnerDiv.firstChild);
  }

  gameStatus = "inProgress";

  for (let i = 0; i < 2; i++) {
    hit();
    hit("dealer");
  }

  setTimeout(function () {
    document.getElementById("hitBtn").toggleAttribute("hidden");
    document.getElementById("standBtn").toggleAttribute("hidden");
  }, 50);

  hitBtn.addEventListener("click", hit);
  standBtn.addEventListener("click", endGame);
  newGameBtn.removeEventListener("click", newGame);
}
initializeGame();
