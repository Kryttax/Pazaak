import * as Utils from "./Utils/Utils.js";
import * as AIPlayer from "./AIPlayer.js";

import { Card, Normal, PlusMinus } from "./Card.js";

let handSum = 0;

let startGameBtn;
let grabCardBtn;
let holdBtn;
let passBtn;
let endGameBtn;

let gameStatusText;

let playerHandText;
let opponentHandText;

let playerCardsImgs;
let playerTableImgs;
let opponentTableImgs;

const Player1 = Symbol("Human");
const Player2 = Symbol("Opponent");

let playerCards = [1, 1, 1, -1, -1, -1];
let opponentCards = [1, 1, 1, -1, -1, -1];
let deckCards = [];

let playerHand = [];
let opponenthand = [];

let playerHold = false;
let opponentHold = false;

let cardsPath = "./img/Pazaak Cards/pazaakCards";

class Player {
  name = "";
  holded = false;
  points = 0;
  isAI = false;
  deckCards = [];
  handCards = [];

  constructor(name, isAI) {
    this.name = name;
    this.isAI = isAI;
  }

  InitDeck() {
    for (let pos = 0; pos < 3; pos++)
      this.deckCards.push(new Card(1, cardsPath + "1.png", Normal));
    for (let neg = 0; neg < 3; neg++)
      this.deckCards.push(new Card(-1, cardsPath + "-1.png", Normal));
  }

  AddPonits(points) {
    this.points += points;
  }
  AddCardToHand(card) {
    this.handCards.push(card);
    return this.handCards.length - 1;
  }
  RemoveCardFromHand(index) {
    return this.handCards.splice(index, 1)[0];
  }

  AddCardToDeck(card) {
    this.deckCards.push(card);
    return this.deckCards.length - 1;
  }
  RemoveCardFromDeck(index) {
    return this.deckCards.splice(index, 1)[0];
  }

  UseCardFromHand(index)
  {
    var card = this.RemoveCardFromDeck(index);
    this.AddPonits(card.value);
    return card;
  }
}

let currentPlayer;
let otherPlayer;

function AssignButtons() {
  console.log("Assigning buttons...");
  startGameBtn = document.getElementById("start");
  startGameBtn.addEventListener("click", InitGame, false);
  grabCardBtn = document.getElementById("grab");
  grabCardBtn.addEventListener("click", GrabCard, false);
  holdBtn = document.getElementById("hold");
  holdBtn.addEventListener("click", HoldPlayer, false);
  passBtn = document.getElementById("pass");
  passBtn.addEventListener("click", PassTurn, false);
  endGameBtn = document.getElementById("end");
  endGameBtn.addEventListener("click", EndGame, false);
}

AssignButtons();

function InitGame() {
  console.log("Initiating game params...");
  gameStatusText = document.getElementById("statusText");
  playerHandText = document.getElementById("playerText");
  opponentHandText = document.getElementById("opponentText");

  playerCardsImgs = document.getElementById("playerCardsImg");
  playerTableImgs = document.getElementById("playerTableImg");
  opponentTableImgs = document.getElementById("opponentTableImg");

  startGameBtn.style.visibility = "hidden";
  grabCardBtn.style.visibility = "visible";
  holdBtn.style.visibility = "visible";

  playerHandText.style.visibility = "visible";
  opponentHandText.style.visibility = "visible";

  playerHandText.textContent = 0;
  opponentHandText.textContent = 0;

  LockButtons();
  currentPlayer = new Player("You", false);
  otherPlayer = new Player("Opponent", true);

  InitDecks();

  console.log("Games params initiated.");
  StartGame();
}

function StartGame() {
  console.log("Starting game...");
  NextRound();
}

function InitDecks() {
  // Main Deck  -- 40 cards, 4 of each (1-10)
  for (let i = 1; i <= 10; i++) 
    for (let j = 0; j < 4; j++)
      deckCards.push(new Card(i, cardsPath + "D" + i + ".png", Normal));

  //Init players' deck
  currentPlayer.InitDeck();
  otherPlayer.InitDeck();
}

function PassTurn() {
  SwitchPlayers();
  NextRound();
}

// Main Game Loop
function NextRound() {
  if (currentPlayer.holded && otherPlayer.holded) {
    EndGame();
    return;
  }

  // Add random card to player
  if (currentPlayer.holded) PassTurn();
  else {
    AssignCardFromMainDeck();
  }
  UpdateUI();

  if (CanGameContinue()) {
    if (!currentPlayer.isAI) UnlockButtons();
    else AITurn();
  }
}

function AITurn() {
  switch (AIPlayer.Decide(currentPlayer.points)) {
    case AIPlayer.Hold:
      HoldPlayer();
      break;
    case AIPlayer.Pass:
      PassTurn();
      break;
    case AIPlayer.PlayCard:
      break;
    default:
      PassTurn();
      break;
  }
}

function SwitchPlayers() {
  console.log("Switching players...");
  let auxPlayer = currentPlayer;
  currentPlayer = otherPlayer;
  otherPlayer = auxPlayer;
}

function AssignCardFromMainDeck() {
  var card = GetRandomCardFromMainDeck();
  var cardImg = CreateStaticCard(card);
  currentPlayer.AddPonits(card.value);
}

function GetRandomCardFromMainDeck() {
  return deckCards.splice(Utils.GetRandomInt(0, deckCards.length - 1), 1)[0];
}

function GetRandomCardFromPlayerDeck() {
  return currentPlayer.RemoveCardFromDeck(
    Utils.GetRandomInt(0, currentPlayer.deckCards.length - 1)
  );
}

function GrabCard() {
  var card = GetRandomCardFromPlayerDeck();
  var index = currentPlayer.AddCardToHand(card);
  var cardImg = CreatePlayableCard(card, index);
  if (CanGameContinue()) PassTurn();
}

function PlayCard(index) {
  // Play a card from hand
  console.log("Playing Card: " + index);
  currentPlayer.UseCardFromHand(index);
  if (CanGameContinue()) PassTurn();
}

function HoldPlayer() {
  currentPlayer.holded = true;
  if (CanGameContinue()) PassTurn();
}

function CanGameContinue() {
  if (CheckIfPazaak() || CheckGameOver()) {
    LockButtons();
    EndGame();
    return false;
  }
  return true;
}

function CheckIfPazaak() {
  return currentPlayer.points === 20;
}

function CheckGameOver() {
  return currentPlayer.points > 20;
}

function EndGame() {
  // Set current Player as non-AI player
  if (currentPlayer.isAI) SwitchPlayers();

  playerHandText.textContent = currentPlayer.points;
  opponentHandText.textContent = otherPlayer.points;

  if (
    currentPlayer.points === otherPlayer.points &&
    currentPlayer.points <= 20 &&
    otherPlayer.points <= 20
  )
    gameStatusText.textContent = "Tied Game";
  else if (currentPlayer.points === 20 || otherPlayer.points > 20) {
    gameStatusText.textContent = "You win!";
  } else if (otherPlayer.points === 20 || currentPlayer.points > 20) {
    gameStatusText.textContent = "Your oponent wins...";
  } else {
    // Check closest to 20
    let winner = Utils.GetClosestTo(
      20,
      currentPlayer.points,
      otherPlayer.points
    );
    if (winner === currentPlayer.points)
      gameStatusText.textContent = "You win!";
    else gameStatusText.textContent = "Your oponent wins...";
  }

  ResetGame();
}

function ResetGame() {
  console.log("Ending game...");
  startGameBtn.style.visibility = "visible";
  grabCardBtn.style.visibility = "hidden";
  holdBtn.style.visibility = "hidden";
  grabCardBtn.disabled = "enabled";
  holdBtn.disabled = "enabled";

  // playerHandText.style.visibility = "hidden";
  // opponentHandText.style.visibility = "hidden";
  console.log("Game ended.");
}

function LockButtons() {
  grabCardBtn.disabled = true;
  holdBtn.disabled = true;
  passBtn.disabled = true;
}

function UnlockButtons() {
  grabCardBtn.disabled = false;
  holdBtn.disabled = false;
  passBtn.disabled = false;
}

function CreateStaticCard(card) {
  var cardImg = document.createElement("img");
  cardImg.setAttribute("class", "cardImg");
  cardImg.setAttribute("src", card.imgSrc);
  cardImg.setAttribute("alt", "Card");
  if(!currentPlayer.isAI)
    playerTableImgs.appendChild(cardImg);
  else
  opponentTableImgs.appendChild(cardImg);
  return cardImg;
}

function CreatePlayableCard(card, index) {
  var cardImg = document.createElement("img");
  cardImg.setAttribute("class", "cardImg");
  cardImg.setAttribute("src", card.imgSrc);
  cardImg.setAttribute("alt", "Card");
  cardImg.addEventListener("click", auxCaller, false);
  cardImg.pos = index;
  function auxCaller() {
    PlayCard(cardImg.pos);
  }
  playerCardsImgs.appendChild(cardImg);
  return cardImg;
}

function ShowCards() {
  playerCardsImgs.style.visibility = "visible";
}

function HideCards() {
  playerCardsImgs.style.visibility = "hidden";
}

function UpdateUI() {
  if (!currentPlayer.isAI) {
    gameStatusText.textContent = "Your Turn";
    playerHandText.textContent = currentPlayer.points;
    ShowCards();
  } else {
    gameStatusText.textContent = "Opponent's Turn";
    opponentHandText.textContent = currentPlayer.points;
    HideCards();
  }
  console.log("UI updated.");
}
