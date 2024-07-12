// DOM Elements
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");
const playersDiv = document.getElementById("playersCards");
const dealersDiv = document.getElementById("dealersCards");
const winnerDiv = document.getElementById("winner");
const pointsDisplay = document.getElementById("pointsDisplay");
const wagerDisplay = document.getElementById("wagerDisplay");
const wagerInput = document.getElementById("wagerInput");
const wagerBtn = document.getElementById("wagerBtn");
const bottomDiv = document.getElementById("bottomDiv");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicSwitch = document.getElementById("musicSwitch");
const standSwitch = document.getElementById("standSwitch");

// Game Variables
const deck = new CardDeck();
const flipDelay = 700;
const slideDelay = 300;
const animationDelay = slideDelay + flipDelay;
let dealersCards, dealerTotal, playersCards, playerTotal, gameStatus;
let playerPoints = 100;
let currentWager = 0;

// Start the game
window.onload = () => {
  let message = document.createElement("h5");
  message.textContent = "Game is loading!";
  winnerDiv.appendChild(message);

  setTimeout(() => {
    setupEventListeners();
    newGameBtn.toggleAttribute("hidden");
    message.textContent = "Game is ready!";
  }, animationDelay * 1.5);
};

function initializeGame() {
  if (playerPoints !== 0) {
    resetGameVariables();
    clearGameBoard();
    initialDeal();
    removeEventListeners();
    setupEventListeners();
    updatePoints();
    newGameBtn.textContent = "New Game";
  }
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
  setTimeout(() => {
    toggleWagerElements();
    let message = document.createElement("h5");
    message.textContent = "Your Turn!";
    winnerDiv.appendChild(message);
  }, animationDelay * 3.6);
}

function toggleGameButtons() {
  hitBtn.toggleAttribute("hidden");
  standBtn.toggleAttribute("hidden");
}

function toggleWagerElements() {
  wagerInput.toggleAttribute("hidden");
  wagerBtn.toggleAttribute("hidden");
}

function removeEventListeners() {
  hitBtn.removeEventListener("click", hit);
  standBtn.removeEventListener("click", endGame);
  newGameBtn.removeEventListener("click", newGame);
  wagerBtn.removeEventListener("click", placeWager);
  musicSwitch.removeEventListener("click", toggleMusic);
}

function toggleMusic() {
  if (musicSwitch.checked) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
}

function setupEventListeners() {
  hitBtn.addEventListener("click", hit);
  standBtn.addEventListener("click", endGame);
  newGameBtn.addEventListener("click", newGame);
  wagerBtn.addEventListener("click", placeWager);
  musicSwitch.addEventListener("click", toggleMusic);
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
  toggleMusic();
}

function placeWager() {
  currentWager = parseInt(wagerInput.value);

  if (!isNaN(currentWager) && currentWager > 0) {
    if (currentWager > playerPoints) {
      alert("Oops! You don't have enough points to place that wager. Your wager has been adjusted to your remaining points.");
      wagerInput.value = playerPoints;
      return;
    }

    playerPoints -= currentWager;
    wagerInput.value = "";
    updatePoints();
    checkStatus("stand");
    toggleGameButtons();
    toggleWagerElements();
  } else {
    alert("Please enter a valid point value to wager. It must be a positive number.");
  }
}

function updatePoints() {
  pointsDisplay.textContent = "Points*: " + playerPoints;
  wagerDisplay.textContent = "Current Wager: " + currentWager;
}

async function hit(player = "player") {
  if (player !== "dealer") {
    await addCard(playersCards, playersDiv, player);
    playerTotal = await calculateTotal(playersCards);
  } else {
    await addCard(dealersCards, dealersDiv, player);
    dealerTotal = await calculateTotal(dealersCards);
  }
  checkStatus("hit");
}

function addCard(cards, div, player) {
  const card = deck.getCard();
  cards.push(card);

  let imgPath = "./cards-1.3/back.png";
  let img = document.createElement("img");
  img.src = imgPath;
  img.classList.add("img-fluid");

  return new Promise((resolve) => {
    img.onload = () => {
      div.appendChild(img);
      img.classList.add("imgSlide");
      if ((player === "dealer" && cards.length !== 2) || player !== "dealer") {
        let finalImgPath = `./cards-1.3/${card.image}`;
        setTimeout(() => {
          img.classList.remove("imgSlide");
          img.src = finalImgPath;
          img.onload = () => {
            flipCard(img, finalImgPath);
            resolve();
          };
        }, slideDelay);
      }
    };
  });
}

function flipCard(cardImg, imgPath) {
  cardImg.classList.remove("imgSlide");
  cardImg.src = imgPath;
  cardImg.onload = () => {
    cardImg.classList.add("imgFlip");
  };
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

function checkStatus(type) {
  if (playerTotal > 21 || dealerTotal > 21) {
    endGame(type);
  } else if (playerTotal === 21 && standSwitch.checked && currentWager !== 0) {
    if (playersCards.length >= 2 && dealersCards.length >= 2) {
      endGame(type);
    }
  }
}

async function playDealer() {
  while (dealerTotal < 17) {
    hit("dealer");
    await new Promise((resolve) => setTimeout(resolve, animationDelay));
  }
}

function endGame(type) {
  if (gameStatus === "inProgress") {
    winnerDiv.removeChild(winnerDiv.firstChild);
    let message = document.createElement("h5");
    message.textContent = "Dealer's Turn!";
    winnerDiv.appendChild(message);

    gameStatus = "gameOver";
    hitBtn.toggleAttribute("hidden");
    standBtn.toggleAttribute("hidden");
    hitBtn.removeEventListener("click", hit);
    standBtn.removeEventListener("click", endGame);

    let dealerSecondCardImg = dealersDiv.getElementsByTagName("img")[1];
    dealerSecondCardImg.classList.remove("imgSlide");
    let imgPath = `./cards-1.3/${dealersCards[1].image}`;
    if (type !== "hit") {
      flipCard(dealerSecondCardImg, imgPath);
    } else {
      setTimeout(() => flipCard(dealerSecondCardImg, imgPath), animationDelay);
    }
    const modifiedDelay = type === "hit" ? 2 * animationDelay : animationDelay;
    setTimeout(async () => {
      playerTotal = await calculateTotal(playersCards);
      dealerTotal = await calculateTotal(dealersCards);
      await playDealer();
      winnerDiv.removeChild(message);
      displayWinner();
    }, modifiedDelay);
  }
}

function displayWinner() {
  let winner = document.createElement("h5");
  let finalHandValues = document.createElement("p");

  if (playerTotal > 21) {
    winner.textContent = "Player Busted, Dealer Wins";
  } else if (dealerTotal > 21) {
    winner.textContent = "Dealer Busted, Player Wins";
    playerPoints += currentWager * 2;
  } else if (dealerTotal > playerTotal) {
    winner.textContent = "Dealer Wins";
  } else if (playerTotal > dealerTotal) {
    winner.textContent = "Player Wins";
    playerPoints += currentWager * 2;
  } else {
    winner.textContent = "Push (Tie)";
    playerPoints += currentWager;
  }

  finalHandValues.textContent = `Final Hand Values: Player - ${playerTotal}, Dealer - ${dealerTotal}`;

  winnerDiv.appendChild(winner);
  winnerDiv.appendChild(finalHandValues);

  currentWager = 0;
  updatePoints();
  if (playerPoints === 0) {
    let message = document.createElement("h5");
    message.textContent = "You are out of points, thank you for playing!";
    message.classList.add("mb-5");
    bottomDiv.appendChild(message);
  } else {
    newGameBtn.toggleAttribute("hidden");
  }
}
