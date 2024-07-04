// DOM Elements
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");
const playersDiv = document.getElementById("playersCards");
const dealersDiv = document.getElementById("dealersCards");
const winnerDiv = document.getElementById("winner");

// Game Variables
const deck = new CardDeck();
let dealersCards, dealerTotal, playersCards, playerTotal, gameStatus;

function endGame() {
  if (gameStatus === "inProgress") {
    gameStatus = "gameOver";
    playDealer();
    hitBtn.toggleAttribute("hidden");
    standBtn.toggleAttribute("hidden");
    newGameBtn.toggleAttribute("hidden");

    hitBtn.removeEventListener("click", hit);
    standBtn.removeEventListener("click", endGame);
    newGameBtn.addEventListener("click", newGame);

    let dealerSecondCardImg = dealersDiv.getElementsByTagName("img")[1];
    dealerSecondCardImg.src = `./cards-1.3/${dealersCards[1].image}`;

    let winner = document.createElement("h3");
    let finalHandValues = document.createElement("p");

    if (playerTotal > 21) {
      winner.textContent = "Player Busted, Dealer Wins";
    } else if (dealerTotal > 21) {
      winner.textContent = "Dealer Busted, Player Wins";
    } else if (dealerTotal > playerTotal) {
      winner.textContent = "Dealer Wins";
    } else if (playerTotal > dealerTotal) {
      winner.textContent = "Player Wins";
    } else {
      winner.textContent = "Push (Tie)";
    }

    finalHandValues.textContent = `Final Hand Values: Player - ${playerTotal}, Dealer - ${dealerTotal}`;

    winnerDiv.appendChild(winner);
    winnerDiv.appendChild(finalHandValues);
  }
}

function calculateTotal(cards) {
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
  while (dealerTotal < 17) {
    hit("dealer");
  }
}

function checkStatus() {
  if (playerTotal > 21 || dealerTotal > 21) {
    endGame();
  }
}

function newGame() {
  newGameBtn.toggleAttribute("hidden");
  deck.newGame();
  initializeGame();
}

function clearDiv(div) {
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

function initializeGame() {
  dealersCards = [];
  playersCards = [];
  dealerTotal = 0;
  playerTotal = 0;

  clearDiv(playersDiv);
  clearDiv(dealersDiv);
  clearDiv(winnerDiv);

  gameStatus = "inProgress";

  for (let i = 0; i < 2; i++) {
    hit();
    hit("dealer");
  }

  setTimeout(function () {
    hitBtn.toggleAttribute("hidden");
    standBtn.toggleAttribute("hidden");
  }, 50);

  hitBtn.addEventListener("click", hit);
  standBtn.addEventListener("click", endGame);
  newGameBtn.removeEventListener("click", newGame);
}
initializeGame();
