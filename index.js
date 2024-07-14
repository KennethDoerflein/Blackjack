// DOM Elements
const hitBtn = document.getElementById("hitBtn");
const splitBtn = document.getElementById("splitBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");
const playersDiv = document.getElementById("playersCards");
const playersDiv2 = document.getElementById("playersCards2");
const dealersDiv = document.getElementById("dealersCards");
const messageDiv = document.getElementById("message");
const pointsDisplay = document.getElementById("pointsDisplay");
const wagerDisplay = document.getElementById("wagerDisplay");
const wagerDiv = document.getElementById("wagerDiv");
const wagerRst = document.getElementById("wagerRst");
const wagerBtn = document.getElementById("wagerBtn");
const allInBtn = document.getElementById("allInBtn");
const chips = document.getElementsByClassName("chip");
const bottomDiv = document.getElementById("bottomDiv");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicSwitch = document.getElementById("musicSwitch");
const standSwitch = document.getElementById("standSwitch");

// Game Variables
const deck = new CardDeck();
const flipDelay = 700;
const slideDelay = 300;
const animationDelay = slideDelay + flipDelay;
let dealersCards, dealerTotal, playersCards, playerTotal, gameStatus, split, playerHand;
let playerPoints = 100;
let currentWager = 0;

// Start the game
window.onload = () => {
  let message = document.createElement("h5");
  message.textContent = "Game is loading!";
  messageDiv.appendChild(message);

  setTimeout(() => {
    setupEventListeners();
    newGameBtn.toggleAttribute("hidden");
    message.textContent = "Game is ready!";
  }, animationDelay * 1);
};

function initializeGame() {
  if (playerPoints !== 0) {
    if (playerHand === 1 && split === true) {
      playersDiv2.toggleAttribute("hidden");
    }

    resetGameVariables();
    clearGameBoard();
    removeEventListeners();
    setupEventListeners();
    updatePoints();
    toggleWagerElements();
    newGameBtn.textContent = "New Game";
    let message = document.createElement("h5");
    message.textContent = "Place your wager to begin!";
    messageDiv.appendChild(message);
  }
}

function resetGameVariables() {
  dealersCards = [];
  playersCards = [[], []];
  dealerTotal = 0;
  playerTotal = [0, 0];
  playerHand = 0;
  gameStatus = "inProgress";
  split = false;
}

function clearGameBoard() {
  clearDiv(playersDiv);
  clearDiv(playersDiv2);
  clearDiv(dealersDiv);
  clearDiv(messageDiv);
}

function initialDeal() {
  hit();
  setTimeout(() => hit("dealer"), animationDelay);
  setTimeout(() => hit(), animationDelay * 2);
  setTimeout(() => hit("dealer"), animationDelay * 3);
  setTimeout(() => {
    toggleGameButtons();
    let message = document.createElement("h5");
    message.textContent = "Your Turn!";
    messageDiv.appendChild(message);

    if (playersCards[playerHand].length === 2 && playersCards[playerHand][0].rank === playersCards[playerHand][1].rank && currentWager > 0) {
      if (currentWager * 2 <= playerPoints) {
        splitBtn.toggleAttribute("hidden");
      }
    }
  }, animationDelay * 3.6);
}

function toggleGameButtons() {
  hitBtn.toggleAttribute("hidden");
  standBtn.toggleAttribute("hidden");
  if (!splitBtn.hasAttribute("hidden")) {
    splitBtn.toggleAttribute("hidden");
  }
}

function toggleWagerElements() {
  wagerDiv.toggleAttribute("hidden");
}

function removeEventListeners() {
  hitBtn.removeEventListener("click", hit);
  splitBtn.removeEventListener("click", splitHand);
  standBtn.removeEventListener("click", endGame);
  newGameBtn.removeEventListener("click", newGame);
  wagerBtn.removeEventListener("click", placeWager);
  allInBtn.removeEventListener("click", placeWager);
  wagerRst.removeEventListener("click", clearWager);
  musicSwitch.removeEventListener("click", toggleMusic);
  removeChipEventListeners();
}

function setupEventListeners() {
  hitBtn.addEventListener("click", hit);
  splitBtn.addEventListener("click", splitHand);
  standBtn.addEventListener("click", endGame);
  newGameBtn.addEventListener("click", newGame);
  wagerBtn.addEventListener("click", placeWager);
  allInBtn.addEventListener("click", placeWager);
  wagerRst.addEventListener("click", clearWager);
  musicSwitch.addEventListener("click", toggleMusic);
  setupChipEventListeners();
}

function setupChipEventListeners() {
  for (let i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", addChipValue);
  }
}

function removeChipEventListeners() {
  for (let i = 0; i < chips.length; i++) {
    chips[i].removeEventListener("click", addChipValue);
  }
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

function addChipValue(event) {
  removeChipEventListeners();
  wagerDisplay.classList.add("highlight");
  this.classList.add("chipFlip");
  let chipValue = parseInt(event.target.dataset.value);
  let newWager = currentWager + chipValue;
  if (newWager <= playerPoints && Number.isInteger(newWager)) {
    currentWager = newWager;
  } else if (newWager > playerPoints) {
    alert("Oops! You don't have enough points to place that wager. Your wager has been adjusted to your remaining points.");
    currentWager = playerPoints;
  }
  updatePoints();
  setTimeout(() => {
    this.classList.remove("chipFlip");
    setupChipEventListeners();
    wagerDisplay.classList.remove("highlight");
  }, flipDelay);
}

function clearWager() {
  currentWager = 0;
  updatePoints();
}

function placeWager(event) {
  var id = event.target.id;
  var isWagerValid = !isNaN(currentWager) && currentWager > 0 && currentWager <= playerPoints;
  var isAllIn = id === "allInBtn";

  if (isWagerValid || isAllIn) {
    if (isAllIn) {
      currentWager = playerPoints;
      playerPoints = 0;
    } else {
      playerPoints -= currentWager;
    }
    updatePoints();
    checkStatus("stand");
    toggleWagerElements();
    initialDeal();
    clearDiv(messageDiv);
  } else {
    alert("The wager must be a number and greater than 0.");
  }
}

function updatePoints() {
  pointsDisplay.textContent = "Points*: " + playerPoints;
  wagerDisplay.textContent = "Current Wager: " + currentWager;
}

async function hit(player = "player") {
  hitBtn.removeEventListener("click", hit);

  if (player !== "dealer") {
    let currentWagerPlayerDiv;
    if (playerHand === 0) {
      currentWagerPlayerDiv = playersDiv;
    } else if (playerHand === 1) {
      currentWagerPlayerDiv = playersDiv2;
    }
    await addCard(playersCards[playerHand], currentWagerPlayerDiv, player);
  } else {
    await addCard(dealersCards, dealersDiv, player);
  }

  playerTotal[playerHand] = await calculateTotal(playersCards[playerHand]);
  dealerTotal = await calculateTotal(dealersCards);

  checkStatus("hit");
  setTimeout(() => {
    hitBtn.addEventListener("click", hit);
  }, animationDelay / 1.2);
}

function addCard(cards, div, player) {
  const card = deck.getCard();
  cards.push(card);

  let imgPath = "./assets/cards-1.3/back.png";
  let img = document.createElement("img");
  img.src = imgPath;
  img.classList.add("img-fluid");

  return new Promise((resolve) => {
    img.onload = () => {
      div.appendChild(img);
      img.classList.add("imgSlide");
      if ((player === "dealer" && cards.length !== 2) || player !== "dealer") {
        let finalImgPath = `./assets/cards-1.3/${card.image}`;
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
  if (playerTotal[playerHand] > 21 || dealerTotal > 21) {
    endGame(type);
  } else if (playerTotal[playerHand] === 21 && standSwitch.checked && currentWager !== 0) {
    if (playersCards[playerHand].length >= 2 && dealersCards.length >= 2) {
      endGame(type);
    }
  }
}

function splitHand() {
  if (playersCards[0].length === 2 && playersCards[0][0].rank === playersCards[0][1].rank) {
    toggleGameButtons();
    splitBtn.toggleAttribute("hidden");
    split = true;

    playersCards[1].push(playersCards[0].pop());

    clearDiv(playersDiv);
    playersDiv2.toggleAttribute("hidden");

    for (let i = 0; i < 2; i++) {
      let imgPath = `./assets/cards-1.3/${playersCards[i][0].image}`;
      let img = document.createElement("img");
      img.src = imgPath;
      img.classList.add("img-fluid", "imgSlide");
      if (i === 0) {
        playersDiv.appendChild(img);
      } else {
        playersDiv2.appendChild(img);
      }
    }

    setTimeout(() => hit(), animationDelay * 0.8);

    setTimeout(() => {
      playerHand = 1;
      hit();
    }, animationDelay * 2);

    setTimeout(() => {
      playerHand = 0;
      playerTotal[1] = calculateTotal(playersCards[1]);
      playerTotal[playerHand] = calculateTotal(playersCards[playerHand]);
      playerPoints -= currentWager;
      currentWager *= 2;
      updatePoints();
      playersDiv.classList.add("activeHand");
      toggleGameButtons();
    }, animationDelay * 3);
  }
}

async function playDealer() {
  while (dealerTotal < 17) {
    await hit("dealer");
    dealerTotal = await calculateTotal(dealersCards);
    await new Promise((resolve) => setTimeout(resolve, animationDelay));
  }
  endGame("dealer");
}

function endGame(type) {
  if (gameStatus === "inProgress" && (playerHand === 1 || split === false)) {
    messageDiv.removeChild(messageDiv.firstChild);
    let message = document.createElement("h5");
    message.textContent = "Dealer's Turn!";
    messageDiv.appendChild(message);

    gameStatus = "gameOver";
    hitBtn.toggleAttribute("hidden");
    standBtn.toggleAttribute("hidden");
    hitBtn.removeEventListener("click", hit);
    standBtn.removeEventListener("click", endGame);

    if (!splitBtn.hasAttribute("hidden")) {
      splitBtn.toggleAttribute("hidden");
    }

    if (playerHand === 1 && split === true) {
      playersDiv2.classList.remove("activeHand");
    }

    let dealerSecondCardImg = dealersDiv.getElementsByTagName("img")[1];
    dealerSecondCardImg.classList.remove("imgSlide");
    let imgPath = `./assets/cards-1.3/${dealersCards[1].image}`;

    if (type !== "hit") {
      flipCard(dealerSecondCardImg, imgPath);
    } else {
      setTimeout(() => flipCard(dealerSecondCardImg, imgPath), animationDelay);
    }

    const modifiedDelay = type === "hit" ? 2 * animationDelay : animationDelay;
    setTimeout(async () => {
      playerTotal[0] = await calculateTotal(playersCards[0]);
      playerTotal[1] = await calculateTotal(playersCards[1]);
      dealerTotal = await calculateTotal(dealersCards);
      await playDealer();
      messageDiv.removeChild(message);
      displayWinner();
    }, modifiedDelay);
  } else if (playerHand === 0 && split === true) {
    playerHand = 1;
    playersDiv2.classList.add("activeHand");
    playersDiv.classList.remove("activeHand");
  }
}

function displayWinner() {
  let winner = document.createElement("h5");
  let winner2;
  let finalHandValues = document.createElement("p");

  let outcomes = [[], []];

  for (let handIndex = 0; handIndex < playersCards.length; handIndex++) {
    let outcome = "";
    let wagerMultiplier = 0;

    if (playerTotal[handIndex] > 21) {
      outcome = "Player Busted, Dealer Wins";
    } else if (dealerTotal > 21) {
      outcome = "Dealer Busted, Player Wins";
      wagerMultiplier = 2;
    } else if (dealerTotal > playerTotal[handIndex]) {
      outcome = "Dealer Wins";
    } else if (playerTotal[handIndex] > dealerTotal) {
      outcome = "Player Wins";
      wagerMultiplier = 2;
    } else {
      outcome = "Push (Tie)";
      wagerMultiplier = 1;
    }

    playerPoints += currentWager * wagerMultiplier;
    outcomes[handIndex] = `Hand ${handIndex + 1}: ${outcome} (Player: ${playerTotal[handIndex]}, Dealer: ${dealerTotal})`;

    winner.textContent = outcomes[0];
    messageDiv.append(winner);

    if (handIndex === 1 && playersCards[handIndex].length > 0) {
      winner2 = document.createElement("h5");
      winner2.textContent = outcomes[1];
      messageDiv.append(winner2);
    }
  }

  currentWager = 0;
  updatePoints();
  if (playerPoints === 0) {
    let message = document.createElement("h5");
    message.textContent = "You are out of points, thank you for playing!";
    message.classList.add("mt-2", "mb-5");
    bottomDiv.appendChild(message);
  } else {
    newGameBtn.toggleAttribute("hidden");
  }
}

function toggleMusic() {
  if (musicSwitch.checked) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
}
