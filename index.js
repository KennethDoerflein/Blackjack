// DOM Elements
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");
const playersDiv = document.getElementById("playersCards");
const dealersDiv = document.getElementById("dealersCards");
const winnerDiv = document.getElementById("winner");

// Game Variables
const deck = new CardDeck();
const flipDelay = 700;
const slideDelay = 300;
const animationDelay = slideDelay + flipDelay;
let dealersCards, dealerTotal, playersCards, playerTotal, gameStatus;

// Start the game
window.onload = () => {
  initializeGame();
};
function initializeGame() {
  resetGameVariables();
  clearGameBoard();
  initialDeal();
  setupEventListeners();
}

function resetGameVariables() {
  dealersCards = [];
  playersCards = [];
  dealerTotal = 0;
  playerTotal = 0;
  gameStatus = "inProgress";
}

function clearGameBoard() {
  clearDiv(playersDiv);
  clearDiv(dealersDiv);
  clearDiv(winnerDiv);
}

function initialDeal() {
  hit();
  setTimeout(() => hit("dealer"), animationDelay);
  setTimeout(() => hit(), animationDelay * 2);
  setTimeout(() => hit("dealer"), animationDelay * 3);
  setTimeout(() => toggleGameButtons(), animationDelay * 3.6);
}

function toggleGameButtons() {
  hitBtn.toggleAttribute("hidden");
  standBtn.toggleAttribute("hidden");
}

function setupEventListeners() {
  hitBtn.addEventListener("click", hit);
  standBtn.addEventListener("click", endGame);
  newGameBtn.removeEventListener("click", newGame);
}

function clearDiv(div) {
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

function newGame() {
  newGameBtn.toggleAttribute("hidden");
  deck.newGame();
  initializeGame();
}

function checkStatus() {
  if (playerTotal > 21 || dealerTotal > 21) {
    endGame();
  }
}

async function playDealer() {
  while (dealerTotal < 17) {
    hit("dealer");
    await new Promise((resolve) => setTimeout(resolve, animationDelay));
  }
}

async function hit(player) {
  if (player !== "dealer") {
    addCard(player, playersCards, playersDiv);
    playerTotal = await calculateTotal(playersCards);
  } else {
    addCard(player, dealersCards, dealersDiv);
    dealerTotal = await calculateTotal(dealersCards);
  }
  checkStatus();
}

function flipCard(cardImg, imgPath) {
  cardImg.classList.remove("imgSlide");
  cardImg.src = imgPath;
  cardImg.onload = () => {
    cardImg.classList.add("imgFlip");
  };
}

function addCard(player, cards, div) {
  cards.push(deck.getCard());
  let imgPath = "./cards-1.3/back.png";
  let img = document.createElement("img");
  img.src = imgPath;

  img.classList.add("img-fluid");
  img.onload = () => {
    div.appendChild(img);
  };

  img.classList.add("imgSlide");

  if ((player === "dealer" && cards.length !== 2) || player !== "dealer") {
    let imgPath = `./cards-1.3/${cards[cards.length - 1].image}`;
    setTimeout(() => {
      flipCard(img, imgPath);
    }, slideDelay);
  }
}

function calculateTotal(cards) {
  return new Promise((resolve) => {
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
    resolve(total);
  });
}

function endGame() {
  setTimeout(() => {
    if (gameStatus === "inProgress") {
      gameStatus = "gameOver";
      hitBtn.toggleAttribute("hidden");
      standBtn.toggleAttribute("hidden");
      newGameBtn.toggleAttribute("hidden");

      hitBtn.removeEventListener("click", hit);
      standBtn.removeEventListener("click", endGame);
      newGameBtn.addEventListener("click", newGame);

      let dealerSecondCardImg = dealersDiv.getElementsByTagName("img")[1];
      dealerSecondCardImg.classList.remove("imgSlide");
      let imgPath = `./cards-1.3/${dealersCards[1].image}`;
      flipCard(dealerSecondCardImg, imgPath);
      setTimeout(async () => {
        await playDealer();
        let winner = document.createElement("h4");
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
      }, animationDelay);
    }
  }, flipDelay);
}
