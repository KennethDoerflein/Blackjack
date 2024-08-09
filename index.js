// ############# Global Variables and Constants #############

// Debug mode variable
const debugMode = false; // Set to true to enable logging

// DOM Elements
const hitBtn = document.getElementById("hitBtn");
const splitBtn = document.getElementById("splitBtn");
const doubleDownBtn = document.getElementById("doubleDownBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");
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
const soft17Switch = document.getElementById("soft17Switch");
const splitSwitch = document.getElementById("splitSwitch");

// Game Variables
const deck = new CardDeck();
const flipDelay = 700;
const slideDelay = 300;
const animationDelay = slideDelay + flipDelay;
let dealersHand, dealerTotal, playersHand, playerTotal, currentPlayerHand, splitCount, previousPlayerHand;
let playerPoints = 100;
let currentWager = [0, 0, 0, 0];

// Array for player's hand elements
const playerHandElements = [
  document.getElementById("playersHand"),
  document.getElementById("playersSecondHand"),
  document.getElementById("playersThirdHand"),
  document.getElementById("playersFourthHand"),
];

// ############# Initialization and Setup #############

// Start the game and show the info modal if not in debug mode
window.onload = async () => {
  if (!debugMode) {
    const infoModal = new bootstrap.Modal(document.getElementById("infoModal"), {
      keyboard: false,
    });
    infoModal.show();
  }
  let message = document.createElement("h6");
  message.textContent = "Game is loading!";
  messageDiv.appendChild(message);

  await delay(animationDelay);
  setupEventListeners();
  newGameBtn.hidden = false;
  message.textContent = "Game is ready!";
};

// Initialize the game state and UI
function initializeGame() {
  if (playerPoints !== 0) {
    if (splitCount > 0) {
      for (let i = 1; i < playerHandElements.length; i++) {
        if (!playerHandElements[i].hasAttribute("hidden")) {
          playerHandElements[i].toggleAttribute("hidden");
        }
      }
    }

    resetGameVariables();
    clearGameBoard();
    removeEventListeners();
    setupEventListeners();
    updatePoints();
    toggleWagerElements();
    enableSettingsButtons();
    newGameBtn.textContent = "New Game";
    let message = document.createElement("h6");
    message.textContent = "Place your wager to begin!";
    messageDiv.appendChild(message);
  }
}

// Reset game variables to their initial state
function resetGameVariables() {
  dealersHand = [];
  playersHand = [[], [], [], []];
  dealerTotal = 0;
  playerTotal = [0, 0, 0, 0];
  currentPlayerHand = 0;
  previousPlayerHand = -1;
  splitCount = 0;
  playerHeader.innerText = `Player's Cards`;
  dealerHeader.innerText = `Dealer's Cards`;
}

// Clear the game board of any existing elements
function clearGameBoard() {
  for (let i = 0; i < playerHandElements.length; i++) {
    clearDiv(playerHandElements[i]);
  }
  clearDiv(dealersDiv);
  clearDiv(messageDiv);
}

// Setup event listeners for game controls
function setupEventListeners() {
  hitBtn.addEventListener("click", hit);
  splitBtn.addEventListener("click", splitHand);
  doubleDownBtn.addEventListener("click", doubleDown);
  standBtn.addEventListener("click", endHand);
  newGameBtn.addEventListener("click", newGame);
  wagerBtn.addEventListener("click", placeWager);
  allInBtn.addEventListener("click", placeWager);
  wagerRst.addEventListener("click", clearWager);
  musicSwitch.addEventListener("click", toggleMusic);
  splitSwitch.addEventListener("click", checkSplitButton);

  setupChipEventListeners();
}

// Remove event listeners for game controls
function removeEventListeners() {
  hitBtn.removeEventListener("click", hit);
  splitBtn.removeEventListener("click", splitHand);
  doubleDownBtn.removeEventListener("click", doubleDown);
  standBtn.removeEventListener("click", endHand);
  newGameBtn.removeEventListener("click", newGame);
  wagerBtn.removeEventListener("click", placeWager);
  allInBtn.removeEventListener("click", placeWager);
  wagerRst.removeEventListener("click", clearWager);
  musicSwitch.removeEventListener("click", toggleMusic);
  splitSwitch.removeEventListener("click", checkSplitButton);

  removeChipEventListeners();
}

// Setup event listeners for chip interactions
function setupChipEventListeners() {
  for (let i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", addChipValue);
  }
}

// Remove event listeners for chip interactions
function removeChipEventListeners() {
  for (let i = 0; i < chips.length; i++) {
    chips[i].removeEventListener("click", addChipValue);
  }
}

// Toggle background music based on the switch state
function toggleMusic() {
  if (musicSwitch.checked) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
}

// ############# Game Actions #############

// Deal initial cards to player and dealer
async function initialDeal() {
  logGameState("Starting initial deal");
  disableGameButtons();
  await hit("player", "init");
  await hit("dealer", "init");
  await hit("player", "init");
  await hit("dealer", "init");
  updateGameButtons();
  let message = document.createElement("h6");
  message.textContent = "Your Turn!";
  messageDiv.appendChild(message);
  logGameState("Initial deal complete");
  autoStandOn21();
  enableGameButtons();
}

// Start a new game by shuffling the deck and resetting the UI
function newGame() {
  newGameBtn.toggleAttribute("hidden");
  deck.newGame();
  initializeGame();
  toggleMusic();
}

// Deal a card to the player or dealer
async function hit(entity = "player", origin = "user") {
  logGameState(`Hit: ${entity}, Origin: ${origin}`);

  hitBtn.removeEventListener("click", hit);
  disableGameButtons();

  await updateHeaders();

  if (entity !== "dealer") {
    await addCard(playersHand[currentPlayerHand], playerHandElements[currentPlayerHand], entity);
  } else {
    await addCard(dealersHand, dealersDiv, entity);
  }

  await updateHeaders(origin);
  if (entity !== "dealer" && origin === "user") {
    updateGameButtons();
    if (playerTotal[currentPlayerHand] > 21) {
      hideGameButtons();
      await endHand();
    } else {
      autoStandOn21();
    }
  }

  await delay(animationDelay);
  hitBtn.addEventListener("click", hit);
  enableGameButtons();
}

// Handle the player doubling down their wager
async function doubleDown() {
  if (isDoubleDownAllowed()) {
    logGameState("Doubling Down");
    disableGameButtons();
    playerPoints -= currentWager[currentPlayerHand];
    currentWager[currentPlayerHand] *= 2;
    updatePoints();
    await hit("player", "doubleDown");
    enableGameButtons();
    endHand();
  }
}

// Split the player's hand into two separate hands
async function splitHand() {
  if (isSplitAllowed()) {
    disableGameButtons();
    splitCount++;
    previousPlayerHand = currentPlayerHand;

    playersHand[splitCount].push(playersHand[currentPlayerHand].pop());
    await updateHandTotals();

    clearDiv(playerHandElements[currentPlayerHand]);
    clearDiv(playerHandElements[splitCount]);

    createAndAppendCardImages(currentPlayerHand);
    createAndAppendCardImages(splitCount);

    playerHandElements[splitCount].toggleAttribute("hidden");

    await updateHeaders();
    await delay(animationDelay);
    await hit("player", "split");
    currentPlayerHand = splitCount;
    await hit("player", "split");

    currentWager[currentPlayerHand] = currentWager[previousPlayerHand];
    currentPlayerHand = previousPlayerHand;
    playerPoints -= currentWager[currentPlayerHand];
    updatePoints();
    playerHandElements[currentPlayerHand].classList.add("activeHand");
    updateGameButtons();
    enableGameButtons();
    autoStandOn21();
  }
}

// Play the dealer's hand according to the rules
async function playDealer() {
  while (shouldDealerHit(dealerTotal, dealersHand)) {
    await hit("dealer", "endGame");
    dealerTotal = await calculateTotal(dealersHand);
  }
}

// End the current hand and proceed to the next hand or end the game
async function endHand() {
  logGameState("Ending hand");
  if (currentPlayerHand === splitCount) {
    messageDiv.removeChild(messageDiv.firstChild);
    let message = document.createElement("h6");
    message.textContent = "Dealer's Turn!";
    messageDiv.appendChild(message);

    hideGameButtons();
    hitBtn.removeEventListener("click", hit);
    standBtn.removeEventListener("click", endHand);

    if (splitCount > 0) {
      playerHandElements[currentPlayerHand].classList.remove("activeHand");
    }

    let dealerSecondCardImg = dealersDiv.getElementsByTagName("img")[1];
    let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;

    await delay(animationDelay / 2);

    await preloadImage(imgPath);
    dealerSecondCardImg.src = imgPath;
    // Animate the card flip
    animateElement(dealerSecondCardImg, "imgFlip", flipDelay);

    updateHeaders("endGame");

    if (shouldDealerHit(dealerTotal, dealersHand)) await delay(flipDelay);
    await playDealer();
    messageDiv.removeChild(message);
    displayWinner();
  } else if (currentPlayerHand !== splitCount) {
    advanceHand();
  }
}

// Advance to the next player hand if splits occurred
function advanceHand() {
  logGameState("Advancing Hand");
  if (currentPlayerHand < splitCount && splitCount > 0) {
    previousPlayerHand = currentPlayerHand;
    currentPlayerHand += 1;
    if (currentPlayerHand <= splitCount) updateGameButtons();
    playerHandElements[currentPlayerHand].classList.add("activeHand");
    playerHandElements[previousPlayerHand].classList.remove("activeHand");
    updatePoints();
    autoStandOn21();
  }
}

// Display the outcome of the game and update player points
function displayWinner() {
  updateHeaders("endGame");

  let outcomes = [[], []];

  for (let handIndex = 0; handIndex < playersHand.length; handIndex++) {
    if (playersHand[handIndex].length === 0) continue;

    let outcome = "";
    let wagerMultiplier = 1;
    if (playerTotal[handIndex] > 21) {
      outcome = "Player Busted, Dealer Wins";
      wagerMultiplier = 0;
    } else if (dealerTotal > 21 || playerTotal[handIndex] > dealerTotal) {
      if (playerTotal[handIndex] === 21 && playersHand[handIndex].length === 2) {
        outcome = "Blackjack, Player Wins";
      } else {
        outcome = dealerTotal > 21 ? "Dealer Busted, Player Wins" : "Player Wins";
      }
      wagerMultiplier = playerTotal[handIndex] === 21 && playersHand[handIndex].length === 2 ? 2.2 : 2;
    } else if (dealerTotal > playerTotal[handIndex]) {
      outcome = "Dealer Wins";
      wagerMultiplier = 0;
    } else {
      outcome = "Push (Tie)";
    }

    playerPoints += Math.ceil(currentWager[handIndex] * wagerMultiplier);
    outcomes[handIndex] = splitCount > 0 ? `Hand ${handIndex + 1}: ${outcome}` : outcome;

    let winnerElement = createWinnerElement(outcomes[handIndex]);
    messageDiv.append(winnerElement);
  }

  currentWager = [0, 0, 0, 0];
  updatePoints();
  if (playerPoints === 0) {
    let message = createWinnerElement("You are out of points, thank you for playing!");
    message.classList.add("mt-2", "mb-5");
    bottomDiv.appendChild(message);
  } else {
    newGameBtn.toggleAttribute("hidden");
  }
}

// ############# Card Management and Display #############

// Add a card to the specified hand and update UI
async function addCard(cards, div, entity) {
  const viewportWidth = window.innerWidth * 0.85;

  const card = deck.getCard();
  cards.push(card);

  const imgElement = await createCardImage("./assets/cards-1.3/back.png");

  if (cards.length > 2) {
    adjustCardMargins(cards, div, imgElement, viewportWidth);
  }

  div.appendChild(imgElement);

  await animateElement(imgElement, "imgSlide", slideDelay);

  if (shouldFlipCard(entity, cards)) {
    const finalImgPath = `./assets/cards-1.3/${card.image}`;
    imgElement.src = await preloadAndGetImage(finalImgPath);
    animateElement(imgElement, "imgFlip", flipDelay);
  }

  await updateHandTotals();
}

// create an HTML image element
async function createCardImage(initialSrc) {
  await preloadImage(initialSrc);
  const imgElement = document.createElement("img");
  imgElement.src = initialSrc;
  return imgElement;
}

// Calculate and adjust card margins to avoid overflow
function adjustCardMargins(cards, div, imgElement, viewportWidth) {
  const images = div.querySelectorAll("img");
  const cardCount = cards.length;

  // Calculate image width and available space
  const imgWidthPx = images[0].offsetWidth;
  const imgWidthVw = (imgWidthPx / viewportWidth) * 100 + 2;
  const overlapFactor = window.innerHeight > window.innerWidth ? 1 : 0.75;
  // const maxImageOffsetVw = -overlapFactor * imgWidthVw;
  const maxImageOffsetPx = -overlapFactor * imgWidthPx;
  // Calculate total space needed for all cards
  const totalCardsWidthVw = imgWidthVw * cardCount - 2;
  // const totalCardsWidthPx = imgWidthPx * cardCount + (cardCount - 1) * 12;
  const maxTotalCardsWidthVw = 85;

  // Calculate margin between cards
  let marginLeftVw = 0;
  let marginLeftPx = 0;
  // console.log("totalCardsWidthVw: " + totalCardsWidthVw);
  // console.log("maxTotalCardsWidthVw: " + maxTotalCardsWidthVw);

  if (totalCardsWidthVw > maxTotalCardsWidthVw) {
    marginLeftVw = -((totalCardsWidthVw - maxTotalCardsWidthVw) / (cardCount - 1));
    marginLeftPx = (marginLeftVw / maxTotalCardsWidthVw) * viewportWidth;

    // const finalMarginVw = Math.max(marginLeftVw, maxImageOffsetVw);
    const finalMarginPx = Math.max(marginLeftPx, maxImageOffsetPx);

    if (imgElement !== null) {
      if (finalMarginPx <= 0) {
        console.log("finalMarginPx: " + finalMarginPx);
        imgElement.style.marginLeft = `${finalMarginPx}px`;
      }
    }
  }

  images.forEach((img, index) => {
    if (index !== 0) {
      // const finalMarginVw = Math.max(marginLeftVw, maxImageOffsetVw);
      const finalMarginPx = Math.max(marginLeftPx, maxImageOffsetPx);
      if (finalMarginPx <= 0) {
        img.style.marginLeft = `${finalMarginPx}px`;
      }
    }
  });
}

// Check if a card should be face up
function shouldFlipCard(entity, cards) {
  return entity !== "dealer" || cards.length !== 2;
}

// Preload an image and return its src
async function preloadAndGetImage(src) {
  await preloadImage(src);
  return src;
}

// Preload an image
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
  });
}

// Animate the card with a given class and delay
function animateElement(element, animationClass, delayTime) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      element.classList.add(animationClass);
    });
    requestAnimationFrame(async () => {
      await delay(delayTime);
      element.classList.remove(animationClass);
      resolve();
    });
  });
}

// Create and append card images to the player's hand
function createAndAppendCardImages(handIndex) {
  playersHand[handIndex].forEach((card) => {
    let imgPath = `./assets/cards-1.3/${card.image}`;
    let img = document.createElement("img");
    img.src = imgPath;
    animateElement(img, "imgSlide", slideDelay);
    playerHandElements[handIndex].appendChild(img);
  });
}

// ############# Hand and Total Calculations #############

// Calculate the total points for a given hand
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

// Update the totals for all player hands and dealer hand
async function updateHandTotals() {
  for (let i = 0; i < playerTotal.length; i++) {
    playerTotal[i] = await calculateTotal(playersHand[i]);
  }
  dealerTotal = await calculateTotal(dealersHand);
}

// Automatically stand if the player’s total is 21
function autoStandOn21() {
  logGameState("Check autoStandOn21");
  if (playerTotal[currentPlayerHand] === 21 && standSwitch.checked) {
    endHand();
  }
}

// Check if a hand is a soft 17 (total 17 with an Ace counted as 11)
function isSoft17(cards) {
  const totalWithoutAces = calculateTotalWithoutAces(cards);
  const numAces = countAces(cards);
  return totalWithoutAces === 6 && numAces > 0;
}

// Check if the split button should be shown based on split switch (point value or rank)
function checkSplitButton() {
  splitBtn.hidden = !hitBtn.hidden && isSplitAllowed() ? false : true;
}

// Calculate total points for a hand, excluding reduction of Aces to 1
function calculateTotalWithoutAces(cards) {
  let total = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].rank !== "ace") {
      total += cards[i].pointValue;
    }
  }
  return total;
}

// Count the number of Aces in a hand
function countAces(cards) {
  return cards.filter((card) => card.rank === "ace").length;
}

// ############# Wager Management #############

// Update the display of player points and current wager
function updatePoints() {
  pointsDisplay.textContent = "Points*: " + playerPoints;
  wagerDisplay.textContent = "Current Hand's Wager: " + currentWager[currentPlayerHand];
}

// Add chip value to the current wager
function addChipValue(event) {
  logGameState("Adding chip value");
  removeChipEventListeners();

  animateElement(wagerDisplay, "highlight", flipDelay);
  animateElement(event.target, "chipFlip", flipDelay);

  let chipValue = parseInt(event.target.dataset.value);
  let newWager = currentWager[currentPlayerHand] + chipValue;

  if (newWager <= playerPoints && Number.isInteger(newWager)) {
    currentWager[currentPlayerHand] = newWager;
  } else if (newWager > playerPoints) {
    alert("Oops! You don't have enough points to place that wager. Your wager has been adjusted to your remaining points.");
    currentWager[currentPlayerHand] = playerPoints;
  }

  updatePoints();
  setupChipEventListeners();
}

// Place the wager and start the initial deal
function placeWager(event) {
  logGameState("Placing wager");
  var id = event.target.id;
  var isWagerValid = !isNaN(currentWager[currentPlayerHand]) && currentWager[currentPlayerHand] > 0 && currentWager[currentPlayerHand] <= playerPoints;
  var isAllIn = id === "allInBtn";

  if (isWagerValid || isAllIn) {
    if (isAllIn) {
      currentWager[currentPlayerHand] = playerPoints;
      playerPoints = 0;
    } else {
      playerPoints -= currentWager[currentPlayerHand];
    }
    disableSettingsButtons();
    updatePoints();
    toggleWagerElements();
    initialDeal();
    clearDiv(messageDiv);
  } else {
    alert("The wager must be a number and greater than 0.");
  }
}

// Toggle the visibility of wager elements
function toggleWagerElements() {
  wagerDiv.hidden = !wagerDiv.hidden;
}

// ############# UI Updates #############

// Update the headers with current player and dealer totals
async function updateHeaders(origin) {
  const handText = [];
  if (splitCount > 0) {
    for (let i = 0; i <= splitCount; i++) {
      handText.push(`Hand ${i + 1}: ${playerTotal[i]}`);
    }
    playerHeader.innerText = `Player's Cards (${handText.join(", ")})`;
  } else {
    playerHeader.innerText = `Player's Cards (Total: ${playerTotal[0]})`;
  }
  if (origin === "endGame") {
    dealerHeader.innerText = `Dealer's Cards (Total: ${dealerTotal})`;
  }
}

// Update game buttons based on current game state
function updateGameButtons() {
  const canPlay = playerTotal[currentPlayerHand] <= 21;
  // Update button visibility
  hitBtn.hidden = !canPlay;
  standBtn.hidden = false;
  splitBtn.hidden = !isSplitAllowed();
  doubleDownBtn.hidden = !isDoubleDownAllowed();
}

// Hide game buttons from view
function hideGameButtons() {
  hitBtn.hidden = true;
  standBtn.hidden = true;
  splitBtn.hidden = true;
  doubleDownBtn.hidden = true;
}

// Clear all child elements from a given div
function clearDiv(div) {
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
function handleResize() {
  if (dealerTotal > 0) {
    const viewportWidth = window.innerWidth * 0.85;
    for (let i = 0; i < playerHandElements.length; i++) {
      if (playersHand[i].length > 0) {
        adjustCardMargins(playersHand[i], playerHandElements[i], null, viewportWidth);
      }
    }
    adjustCardMargins(dealersHand, dealersDiv, null, viewportWidth);
  }
  lastWidth = window.innerWidth;
  lastHeight = window.innerHeight;
}

// Add event listener for resize
window.addEventListener("resize", handleResize);

// ############# Utilities and Debugging #############

// Create a delay in milliseconds
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Log the game state to the console for debugging
function logGameState(action) {
  if (debugMode) {
    console.log(`[${new Date().toISOString()}] Action: ${action}`);
    console.log(`Dealers Hand: ${JSON.stringify(dealersHand)}`);
    console.log(`Players Hand: ${JSON.stringify(playersHand)}`);
    console.log(`Dealer Total: ${dealerTotal}`);
    console.log(`Player Total: ${JSON.stringify(playerTotal)}`);
    console.log(`Current Wager: ${JSON.stringify(currentWager)}`);
    console.log(`Player Points: ${playerPoints}`);
    console.log(`Current Player Hand: ${currentPlayerHand}`);
    console.log(`Split Count: ${splitCount}`);
    console.log(`Previous Hand: ${previousPlayerHand}`);
    console.log("----------------------------------");
  }
}

// Determine if the dealer should hit based on game rules
function shouldDealerHit(total, hand) {
  if (soft17Switch.checked) {
    return total < 17 || (total === 17 && isSoft17(hand));
  }
  return total < 17;
}

// Check if splitting is allowed based on current hand and rules
function isSplitAllowed() {
  const isMatchingRankOrValue = splitSwitch.checked
    ? playersHand[currentPlayerHand][0].rank === playersHand[currentPlayerHand][1].rank
    : playersHand[currentPlayerHand][0].pointValue === playersHand[currentPlayerHand][1].pointValue;

  return splitCount < 3 && playersHand[currentPlayerHand].length === 2 && isMatchingRankOrValue && isWagerAllowed();
}

// Check if doubling down is allowed based on current hand and rules
function isDoubleDownAllowed() {
  return playersHand[currentPlayerHand].length === 2 && playerTotal[currentPlayerHand] <= 21 && isWagerAllowed();
}

// Check if the current wager is allowed based on player points
function isWagerAllowed() {
  return currentWager[currentPlayerHand] <= playerPoints;
}

// Clear the wager for the current hand
function clearWager() {
  currentWager[currentPlayerHand] = 0;
  updatePoints();
}

// Create and return a winner element with the outcome text
function createWinnerElement(outcome) {
  let winner = document.createElement("h6");
  winner.textContent = outcome;
  return winner;
}

// Enable game buttons
function enableGameButtons() {
  hitBtn.disabled = false;
  standBtn.disabled = false;
  splitBtn.disabled = false;
  doubleDownBtn.disabled = false;
}

// Disable game buttons
function disableGameButtons() {
  hitBtn.disabled = true;
  standBtn.disabled = true;
  splitBtn.disabled = true;
  doubleDownBtn.disabled = true;
}

// Enable settings buttons
function enableSettingsButtons() {
  splitSwitch.disabled = false;
  soft17Switch.disabled = false;
}

// Disable settings buttons
function disableSettingsButtons() {
  splitSwitch.disabled = true;
  soft17Switch.disabled = true;
}

// ############# Touchscreen Specific Listeners #############

let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    let now = new Date().getTime();
    if (now - lastTouchEnd <= 400) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

// ### Zoom in/out Detection
let scaling = false;

function pinchStart(e) {
  if (e.touches.length === 2) {
    scaling = true;
  }
}

function pinchMove() {
  if (scaling) {
    handleResize();
  }
}

async function pinchEnd() {
  scaling = false;
  await delay(500);
  handleResize();
}

document.addEventListener("touchstart", pinchStart, false);
document.addEventListener("touchmove", pinchMove, false);
document.addEventListener("touchend", pinchEnd, false);
document.addEventListener("touchcancel", pinchEnd, false);
