// DOM Elements
const hitBtn = document.getElementById("hitBtn");
const splitBtn = document.getElementById("splitBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");
const playersDiv = document.getElementById("playersHand");
const playersDiv2 = document.getElementById("playersSecondHand");
const dealersDiv = document.getElementById("dealersHand");
const messageDiv = document.getElementById("message");
const dealerHeader = document.getElementById("dealerHeader");
const playerHeader = document.getElementById("playerHeader");
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
let dealersHand, dealerTotal, playersHand, playerTotal, gameStatus, split, currentPlayerHand;
let playerPoints = 100;
let currentWager = 0;

// Start the game
window.onload = () => {
  let message = document.createElement("h6");
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
    if (currentPlayerHand === 1 && split === true) {
      playersDiv2.toggleAttribute("hidden");
    }

    resetGameVariables();
    clearGameBoard();
    removeEventListeners();
    setupEventListeners();
    updatePoints();
    toggleWagerElements();
    newGameBtn.textContent = "New Game";
    let message = document.createElement("h6");
    message.textContent = "Place your wager to begin!";
    messageDiv.appendChild(message);
  }
}

function resetGameVariables() {
  dealersHand = [];
  playersHand = [[], []];
  dealerTotal = 0;
  playerTotal = [0, 0];
  currentPlayerHand = 0;
  gameStatus = "inProgress";
  split = false;
  playerHeader.innerText = `Player's Cards`;
  dealerHeader.innerText = `Dealer's Cards`;
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
    checkStatus("stand");
    toggleGameButtons();
    let message = document.createElement("h6");
    message.textContent = "Your Turn!";
    messageDiv.appendChild(message);

    if (playersHand[currentPlayerHand].length === 2 && playersHand[currentPlayerHand][0].rank === playersHand[currentPlayerHand][1].rank && currentWager > 0) {
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

async function updateHeaders() {
  playerTotal[0] = await calculateTotal(playersHand[0]);
  playerTotal[1] = await calculateTotal(playersHand[1]);
  dealerTotal = await calculateTotal(dealersHand);

  if (playersDiv2.hasAttribute("hidden")) {
    playerHeader.innerText = `Player's Cards (Total: ${playerTotal[0]})`;
  } else {
    playerHeader.innerText = `Player's Cards (Hand 1: ${playerTotal[0]}, Hand 2: ${playerTotal[1]})`;
  }
  if (gameStatus !== "inProgress") {
    dealerHeader.innerText = `Dealer's Cards (Total: ${dealerTotal})`;
  }
}

async function hit(player = "player") {
  hitBtn.removeEventListener("click", hit);

  if (player !== "dealer") {
    let currentWagerPlayerDiv;
    if (currentPlayerHand === 0) {
      currentWagerPlayerDiv = playersDiv;
    } else if (currentPlayerHand === 1) {
      currentWagerPlayerDiv = playersDiv2;
    }
    await addCard(playersHand[currentPlayerHand], currentWagerPlayerDiv, player);
  } else {
    await addCard(dealersHand, dealersDiv, player);
  }

  playerTotal[0] = await calculateTotal(playersHand[0]);
  playerTotal[1] = await calculateTotal(playersHand[1]);
  await updateHeaders();
  dealerTotal = await calculateTotal(dealersHand);

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
  if (playerTotal[currentPlayerHand] > 21 || dealerTotal > 21) {
    endGame(type);
  } else if (playerTotal[currentPlayerHand] === 21 && standSwitch.checked && currentWager !== 0) {
    if (playersHand[currentPlayerHand].length >= 2 && dealersHand.length >= 2) {
      endGame(type);
    }
  }
}

function splitHand() {
  if (playersHand[0].length === 2 && playersHand[0][0].rank === playersHand[0][1].rank) {
    toggleGameButtons();
    split = true;

    playersHand[1].push(playersHand[0].pop());

    playerTotal[0] = playersHand[0][0].pointValue;
    playerTotal[1] = playersHand[1][0].pointValue;
    updateHeaders();

    clearDiv(playersDiv);
    playersDiv2.toggleAttribute("hidden");

    for (let i = 0; i < 2; i++) {
      let imgPath = `./assets/cards-1.3/${playersHand[i][0].image}`;
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
      currentPlayerHand = 1;
      hit();
    }, animationDelay * 2);

    setTimeout(() => {
      currentPlayerHand = 0;
      playerTotal[1] = calculateTotal(playersHand[1]);
      playerTotal[currentPlayerHand] = calculateTotal(playersHand[currentPlayerHand]);
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
    dealerTotal = await calculateTotal(dealersHand);
    await new Promise((resolve) => setTimeout(resolve, animationDelay));
  }
  endGame("dealer");
}

function endGame(type) {
  if (gameStatus === "inProgress" && (currentPlayerHand === 1 || split === false)) {
    messageDiv.removeChild(messageDiv.firstChild);
    let message = document.createElement("h6");
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

    if (currentPlayerHand === 1 && split === true) {
      playersDiv2.classList.remove("activeHand");
    }

    let dealerSecondCardImg = dealersDiv.getElementsByTagName("img")[1];
    dealerSecondCardImg.classList.remove("imgSlide");
    let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;

    if (type !== "hit") {
      flipCard(dealerSecondCardImg, imgPath);
    } else {
      setTimeout(() => flipCard(dealerSecondCardImg, imgPath), animationDelay);
    }

    updateHeaders();

    const modifiedDelay = type === "hit" ? 2 * animationDelay : animationDelay;
    setTimeout(async () => {
      playerTotal[0] = await calculateTotal(playersHand[0]);
      playerTotal[1] = await calculateTotal(playersHand[1]);
      dealerTotal = await calculateTotal(dealersHand);
      await playDealer();
      messageDiv.removeChild(message);
      displayWinner();
    }, modifiedDelay);
  } else if (currentPlayerHand === 0 && split === true) {
    currentPlayerHand = 1;
    playersDiv2.classList.add("activeHand");
    playersDiv.classList.remove("activeHand");
  }
}

function displayWinner() {
  let winner = document.createElement("h6");
  let winner2;
  let finalHandValues = document.createElement("p");

  updateHeaders();

  let outcomes = [[], []];

  for (let handIndex = 0; handIndex < playersHand.length; handIndex++) {
    let outcome = "";
    let wagerMultiplier = 0;

    if (playersHand[handIndex].length === 0) continue;

    if (playerTotal[handIndex] > 21) {
      outcome = "Player Busted, Dealer Wins";
      wagerMultiplier = 0;
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
    if (currentPlayerHand === 1) {
      outcomes[handIndex] = `Hand ${handIndex + 1}: ${outcome}`;
    } else {
      outcomes[handIndex] = `${outcome}`;
    }

    winner.textContent = outcomes[0];
    messageDiv.append(winner);

    if (handIndex === 1 && playersHand[handIndex].length > 0) {
      winner2 = document.createElement("h6");
      winner2.textContent = outcomes[1];
      messageDiv.append(winner2);
    }
  }

  currentWager = 0;
  updatePoints();
  if (playerPoints === 0) {
    let message = document.createElement("h6");
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
