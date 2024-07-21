// Debug mode variable
const debugMode = false; // Set to false to disable logging

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

// Start the game
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

// Initialize the game
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
    newGameBtn.textContent = "New Game";
    let message = document.createElement("h6");
    message.textContent = "Place your wager to begin!";
    messageDiv.appendChild(message);
  }
}

// Reset game variables
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

// Clear game board
function clearGameBoard() {
  for (let i = 0; i < playerHandElements.length; i++) {
    clearDiv(playerHandElements[i]);
  }
  clearDiv(dealersDiv);
  clearDiv(messageDiv);
}

// Initial deal
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

// update game buttons
function updateGameButtons() {
  const canPlay = playerTotal[currentPlayerHand] <= 21;
  // Update button visibility
  hitBtn.hidden = !canPlay;
  standBtn.hidden = false;
  splitBtn.hidden = !isSplitAllowed();
  doubleDownBtn.hidden = !isDoubleDownAllowed();
}

// Hide game buttons
function hideGameButtons() {
  hitBtn.hidden = true;
  standBtn.hidden = true;
  splitBtn.hidden = true;
  doubleDownBtn.hidden = true;
}

function toggleWagerElements() {
  wagerDiv.hidden = !wagerDiv.hidden;
}

// Remove event listeners
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
  removeChipEventListeners();
}

// Setup event listeners
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
  setupChipEventListeners();
}

// Setup chip event listeners
function setupChipEventListeners() {
  for (let i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", addChipValue);
  }
}

// Remove chip event listeners
function removeChipEventListeners() {
  for (let i = 0; i < chips.length; i++) {
    chips[i].removeEventListener("click", addChipValue);
  }
}

// Clear div content
function clearDiv(div) {
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

// Start a new game
function newGame() {
  newGameBtn.toggleAttribute("hidden");
  deck.newGame();
  initializeGame();
  toggleMusic();
}

// Add chip value to the wager
function addChipValue(event) {
  logGameState("Adding chip value");
  removeChipEventListeners();
  requestAnimationFrame(async () => {
    wagerDisplay.classList.add("highlight");
    event.target.classList.add("chipFlip");

    let chipValue = parseInt(event.target.dataset.value);
    let newWager = currentWager[currentPlayerHand] + chipValue;
    if (newWager <= playerPoints && Number.isInteger(newWager)) {
      currentWager[currentPlayerHand] = newWager;
    } else if (newWager > playerPoints) {
      alert("Oops! You don't have enough points to place that wager. Your wager has been adjusted to your remaining points.");
      currentWager[currentPlayerHand] = playerPoints;
    }
    updatePoints();
    await delay(flipDelay);
    event.target.classList.remove("chipFlip");
    setupChipEventListeners();
    wagerDisplay.classList.remove("highlight");
  });
}

// Clear the wager
function clearWager() {
  currentWager[currentPlayerHand] = 0;
  updatePoints();
}

// Place the wager
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
    updatePoints();
    toggleWagerElements();
    initialDeal();
    clearDiv(messageDiv);
  } else {
    alert("The wager must be a number and greater than 0.");
  }
}

// Update points display
function updatePoints() {
  pointsDisplay.textContent = "Points*: " + playerPoints;
  wagerDisplay.textContent = "Current Hand's Wager: " + currentWager[currentPlayerHand];
}

// Update headers with current totals
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

// Deal a card to the player or dealer
async function hit(entity = "player", origin = "user") {
  logGameState(`Hit: ${entity}, Origin: ${origin}`);

  hitBtn.removeEventListener("click", hit);

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
}

// Add a card to the specified hand
function addCard(cards, div, entity) {
  const card = deck.getCard();
  cards.push(card);

  let imgPath = "./assets/cards-1.3/back.png";
  let img = document.createElement("img");
  img.src = imgPath;
  img.classList.add("img-fluid");

  return new Promise((resolve) => {
    img.onload = async () => {
      div.appendChild(img);
      requestAnimationFrame(() => {
        img.classList.add("imgSlide");
        requestAnimationFrame(async () => {
          if ((entity === "dealer" && cards.length !== 2) || entity !== "dealer") {
            let finalImgPath = `./assets/cards-1.3/${card.image}`;
            await delay(slideDelay);
            img.classList.remove("imgSlide");
            img.src = finalImgPath;
            img.onload = () => {
              flipCard(img, finalImgPath);
            };
          }
          await updateHandTotals();
          resolve();
        });
      });
    };
  });
}

// Flip the card over
function flipCard(cardImg, imgPath) {
  cardImg.classList.remove("imgSlide");
  cardImg.src = imgPath;
  cardImg.onload = () => {
    requestAnimationFrame(() => {
      cardImg.classList.add("imgFlip");
    });
  };
}

// Calculate the total points for a hand
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

// Update the totals for the player's hands and the dealer's hand
async function updateHandTotals() {
  for (let i = 0; i < playerTotal.length; i++) {
    playerTotal[i] = await calculateTotal(playersHand[i]);
  }
  dealerTotal = await calculateTotal(dealersHand);
}

// Handle a player doubling down
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

// Split the player's hand
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

// 'splitHand' helper function to create and append card images
function createAndAppendCardImages(handIndex) {
  playersHand[handIndex].forEach((card) => {
    let imgPath = `./assets/cards-1.3/${card.image}`;
    let img = document.createElement("img");
    img.src = imgPath;
    img.classList.add("img-fluid", "imgSlide");
    playerHandElements[handIndex].appendChild(img);
  });
}

// Play for the dealer
async function playDealer() {
  while (shouldDealerHit(dealerTotal, dealersHand)) {
    await hit("dealer", "endGame");
    dealerTotal = await calculateTotal(dealersHand);
  }
}

// Determine if the dealer should hit based on game rules, including soft 17
function shouldDealerHit(total, hand) {
  if (soft17Switch.checked) {
    return total < 17 || (total === 17 && isSoft17(hand));
  }
  return total < 17;
}

// Check if a hand is a soft 17 (total 17 with an Ace counted as 11)
function isSoft17(cards) {
  const totalWithoutAces = calculateTotalWithoutAces(cards);
  const numAces = countAces(cards);
  return totalWithoutAces === 6 && numAces > 0;
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

// End the game or move to next hand
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
    dealerSecondCardImg.classList.remove("imgSlide");
    let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;

    await delay(animationDelay);
    flipCard(dealerSecondCardImg, imgPath);

    updateHeaders("endGame");

    if (shouldDealerHit(dealerTotal, dealersHand)) await delay(flipDelay);
    await playDealer();
    messageDiv.removeChild(message);
    displayWinner();
  } else if (currentPlayerHand !== splitCount) {
    advanceHand();
  }
}

// Advance to the next hand is splits occurred
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

// Display result
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

// Log game state
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

// ############# Helper Functions #############

// Helper function to create a winner element
function createWinnerElement(outcome) {
  let winner = document.createElement("h6");
  winner.textContent = outcome;
  return winner;
}

function isSplitAllowed() {
  return (
    splitCount < 3 &&
    playersHand[currentPlayerHand].length === 2 &&
    playersHand[currentPlayerHand][0].pointValue === playersHand[currentPlayerHand][1].pointValue &&
    isWagerAllowed()
  );
}

function isWagerAllowed() {
  return currentWager[currentPlayerHand] <= playerPoints;
}

function isDoubleDownAllowed() {
  return playersHand[currentPlayerHand].length === 2 && playerTotal[currentPlayerHand] <= 21 && isWagerAllowed();
}

function autoStandOn21() {
  logGameState("Check autoStandOn21");
  if (playerTotal[currentPlayerHand] === 21 && standSwitch.checked) {
    endHand();
  }
}

// Disable game buttons
function disableGameButtons() {
  hitBtn.disabled = true;
  standBtn.disabled = true;
  splitBtn.disabled = true;
  doubleDownBtn.disabled = true;
}

// Enable game buttons
function enableGameButtons() {
  hitBtn.disabled = false;
  standBtn.disabled = false;
  splitBtn.disabled = false;
  doubleDownBtn.disabled = false;
}

// Utility function to create a delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Toggle background music
function toggleMusic() {
  if (musicSwitch.checked) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
}
