// DOM Elements
const hitBtn = document.getElementById("hitBtn");
const splitBtn = document.getElementById("splitBtn");
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
let dealersHand, dealerTotal, playersHand, playerTotal, gameStatus, split, currentPlayerHand, splitCount, oldHand;
let playerPoints = 100;
let currentWager = 0;

// Array for player's hand elements
const playerHandElements = [
  document.getElementById("playersHand"),
  document.getElementById("playersSecondHand"),
  document.getElementById("playersThirdHand"),
  document.getElementById("playersFourthHand"),
];

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

// Initialize the game
function initializeGame() {
  if (playerPoints !== 0) {
    if (split === true) {
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
  oldHand = -1;
  splitCount = 0;
  gameStatus = "inProgress";
  split = false;
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
function initialDeal() {
  hit();
  setTimeout(() => hit("dealer"), animationDelay);
  setTimeout(() => hit(), animationDelay * 2);
  setTimeout(() => hit("dealer"), animationDelay * 3);
  setTimeout(() => {
    toggleGameButtons();
    let message = document.createElement("h6");
    message.textContent = "Your Turn!";
    messageDiv.appendChild(message);
    checkStatus("hit");
    checkStatus("split");
  }, animationDelay * 3.6);
}
// Toggle game buttons
function toggleGameButtons() {
  hitBtn.toggleAttribute("hidden");
  standBtn.toggleAttribute("hidden");
  if (!splitBtn.hasAttribute("hidden")) {
    splitBtn.toggleAttribute("hidden");
  }
}

// Toggle wager elements
function toggleWagerElements() {
  wagerDiv.toggleAttribute("hidden");
}

// Remove event listeners
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

// Setup event listeners
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

// Clear the wager
function clearWager() {
  currentWager = 0;
  updatePoints();
}

// Place the wager
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

// Update points display
function updatePoints() {
  pointsDisplay.textContent = "Points*: " + playerPoints;
  wagerDisplay.textContent = "Current Wager: " + currentWager;
}

// Update headers with current totals
async function updateHeaders() {
  await updateHandTotals();

  const handText = [];
  if (split) {
    for (let i = 0; i <= splitCount; i++) {
      handText.push(`Hand ${i + 1}: ${playerTotal[i]}`);
    }
    playerHeader.innerText = `Player's Cards (${handText.join(", ")})`;
  } else {
    playerHeader.innerText = `Player's Cards (Total: ${playerTotal[0]})`;
  }

  if (gameStatus !== "inProgress") {
    dealerHeader.innerText = `Dealer's Cards (Total: ${dealerTotal})`;
  }
}

// Deal a card to the player or dealer
async function hit(player = "player") {
  hitBtn.removeEventListener("click", hit);
  await updateHeaders();

  if (player !== "dealer") {
    await addCard(playersHand[currentPlayerHand], playerHandElements[currentPlayerHand], player);
  } else {
    await addCard(dealersHand, dealersDiv, player);
  }

  await updateHandTotals();
  await updateHeaders();
  await updateHandTotals();

  checkStatus("hit");
  setTimeout(() => {
    hitBtn.addEventListener("click", hit);
  }, animationDelay / 1.2);
}

// Add a card to the specified hand
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
      requestAnimationFrame(() => {
        img.classList.add("imgSlide");
      });
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

// Check the status of the game
function checkStatus(type) {
  if (playerTotal[currentPlayerHand] > 21) {
    endGame(type);
  }

  if (playerTotal[currentPlayerHand] === 21 && standSwitch.checked) {
    if (playersHand[currentPlayerHand].length >= 2 && dealersHand.length >= 2) {
      endGame(type);
    }
  }

  const hand = playersHand[currentPlayerHand];

  const isPair = hand.length === 2 && hand[0].pointValue === hand[1].pointValue;
  const canAffordSplit = currentWager / (splitCount + 1) <= playerPoints;
  const isValidSplit = splitCount < 3 && type === "split";
  const splitBtnHidden = splitBtn.hasAttribute("hidden");

  if (isPair && currentWager > 0 && canAffordSplit && isValidSplit && splitBtnHidden) {
    splitBtn.toggleAttribute("hidden");
  } else if (!isPair && !splitBtnHidden) {
    splitBtn.toggleAttribute("hidden");
  }
}

// Split the player's hand
async function splitHand() {
  if (splitCount < 3 && playersHand[currentPlayerHand].length === 2 && playersHand[currentPlayerHand][0].pointValue === playersHand[currentPlayerHand][1].pointValue) {
    toggleGameButtons();
    splitCount++;
    split = true;
    oldHand = currentPlayerHand;

    playersHand[splitCount].push(playersHand[currentPlayerHand].pop());

    clearDiv(playerHandElements[currentPlayerHand]);
    clearDiv(playerHandElements[splitCount]);

    playersHand[currentPlayerHand].forEach((card) => {
      let imgPath = `./assets/cards-1.3/${card.image}`;
      let img = document.createElement("img");
      img.src = imgPath;
      img.classList.add("img-fluid", "imgSlide");
      playerHandElements[currentPlayerHand].appendChild(img);
    });

    playersHand[splitCount].forEach((card) => {
      let imgPath = `./assets/cards-1.3/${card.image}`;
      let img = document.createElement("img");
      img.src = imgPath;
      img.classList.add("img-fluid", "imgSlide");
      playerHandElements[splitCount].appendChild(img);
    });

    playerHandElements[splitCount].toggleAttribute("hidden");

    playerTotal[currentPlayerHand] = await calculateTotal(playersHand[currentPlayerHand]);
    playerTotal[splitCount] = await calculateTotal(playersHand[splitCount]);
    await updateHeaders();

    setTimeout(() => {
      hit();
    }, animationDelay);

    setTimeout(() => {
      currentPlayerHand = splitCount;
      hit();
    }, animationDelay * 2);

    setTimeout(() => {
      currentPlayerHand = oldHand;
      playerPoints -= currentWager / splitCount;
      currentWager += currentWager / splitCount;
      updatePoints();
      playerHandElements[currentPlayerHand].classList.add("activeHand");
      toggleGameButtons();
      checkStatus("split");
    }, animationDelay * 3);
  }
}

// Play for the dealer
async function playDealer() {
  while (shouldDealerHit(dealerTotal, dealersHand)) {
    await hit("dealer");
    dealerTotal = await calculateTotal(dealersHand);
    await new Promise((resolve) => setTimeout(resolve, animationDelay));
  }
  endGame("dealer");
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
function endGame(type) {
  if (gameStatus === "inProgress" && ((oldHand === splitCount - 1 && currentPlayerHand === splitCount) || split === false)) {
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

    if (split === true) {
      playerHandElements[currentPlayerHand].classList.remove("activeHand");
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
      await updateHandTotals();
      await playDealer();
      messageDiv.removeChild(message);
      displayWinner();
    }, modifiedDelay);
  } else if (currentPlayerHand < splitCount && split === true) {
    oldHand = currentPlayerHand;
    currentPlayerHand += 1;
    playerHandElements[currentPlayerHand].classList.add("activeHand");
    playerHandElements[oldHand].classList.remove("activeHand");
    checkStatus("split");
  }
}

// Display result
function displayWinner() {
  let winner = document.createElement("h6");
  let winner2;
  let winner3;
  let winner4;
  let finalHandValues = document.createElement("p");

  updateHeaders();

  let outcomes = [[], []];
  let wagerMultiplier = 0;

  for (let handIndex = 0; handIndex < playersHand.length; handIndex++) {
    let outcome = "";

    if (playersHand[handIndex].length === 0) continue;

    if (playerTotal[handIndex] > 21) {
      outcome = "Player Busted, Dealer Wins";
      wagerMultiplier = 0;
    } else if (dealerTotal > 21) {
      outcome = "Dealer Busted, Player Wins";
      if (playerTotal[handIndex] === 21) wagerMultiplier = 2.5;
      else wagerMultiplier = 2;
    } else if (dealerTotal > playerTotal[handIndex]) {
      outcome = "Dealer Wins";
    } else if (playerTotal[handIndex] > dealerTotal) {
      outcome = "Player Wins";
      if (playerTotal[handIndex] === 21) wagerMultiplier = 2.5;
      else wagerMultiplier = 2;
    } else {
      outcome = "Push (Tie)";
      wagerMultiplier = 1;
    }

    playerPoints += (currentWager / (splitCount + 1)) * wagerMultiplier;
    if (splitCount > 0) {
      outcomes[handIndex] = `Hand ${handIndex + 1}: ${outcome}`;
    } else {
      outcomes[handIndex] = `${outcome}`;
    }

    if (handIndex === 0) {
      winner.textContent = outcomes[handIndex];
      messageDiv.append(winner);
    } else if (handIndex === 1) {
      winner2 = document.createElement("h6");
      winner2.textContent = outcomes[handIndex];
      messageDiv.append(winner2);
    } else if (handIndex === 2) {
      winner3 = document.createElement("h6");
      winner3.textContent = outcomes[handIndex];
      messageDiv.append(winner3);
    } else if (handIndex === 3) {
      winner4 = document.createElement("h6");
      winner4.textContent = outcomes[handIndex];
      messageDiv.append(winner4);
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

// Toggle background music
function toggleMusic() {
  if (musicSwitch.checked) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
}
