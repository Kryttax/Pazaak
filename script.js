import * as Utils from "./Utils/Utils.js";
import * as AIPlayer from "./AIPlayer.js";

import { Card, Normal, PlusMinus } from "./Card.js";

let startGameBtn;
let holdBtn;
let passBtn;
let nextSetBtn;
let endGameBtn;

let gameStatusText;
let currentSetText;

let playerHandText;
let opponentHandText;

let playerCardsImgs;
let playerTableImgs;
let opponentTableImgs;

let currentSet;

let deckCards = [];

let cardsPath = "./img/Pazaak Cards/pazaakCards";

class Player {
  name = "";
  holded = false;
  points = 0;
  isAI = false;
  canPlayCard = true;
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

  UseCardFromHand(index) {
    this.canPlayCard = false;
    var card = this.RemoveCardFromHand(index);
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
  holdBtn = document.getElementById("hold");
  holdBtn.addEventListener("click", HoldPlayer, false);
  passBtn = document.getElementById("pass");
  passBtn.addEventListener("click", PassTurn, false);
  nextSetBtn = document.getElementById("next");
  nextSetBtn.addEventListener("click", MoveToNextSet, false);
  endGameBtn = document.getElementById("end");
  endGameBtn.addEventListener("click", EndGame, false);
}

AssignButtons();

function InitGame() {
  console.log("Initiating game params...");
  gameStatusText = document.getElementById("statusText");
  currentSetText = document.getElementById("setText");
  playerHandText = document.getElementById("playerText");
  opponentHandText = document.getElementById("opponentText");

  playerCardsImgs = document.getElementById("playerCardsImg");
  playerTableImgs = document.getElementById("playerTableImg");
  opponentTableImgs = document.getElementById("opponentTableImg");

  startGameBtn.style.visibility = "hidden";
  nextSetBtn.style.visibility = "hidden";
  holdBtn.style.visibility = "visible";

  playerHandText.style.visibility = "visible";
  opponentHandText.style.visibility = "visible";

  playerHandText.textContent = 0;
  opponentHandText.textContent = 0;

  currentSet = 1;
  currentSetText.textContent = currentSet;

  LockButtons();
  currentPlayer = new Player("You", false);
  otherPlayer = new Player("Opponent", true);

  InitDecks();
  AssignHand();

  console.log("Games params initiated.");
  StartGame();
}

function StartGame() {
  console.log("Starting game...");
  NextRound();
}

function InitDecks() {
  // Main Deck  -- 40 cards, 4 of each (1-10)
  for (var i = 1; i <= 10; i++)
    for (var j = 0; j < 4; j++)
      deckCards.push(new Card(i, cardsPath + "D" + i + ".png", Normal));

  //Init players' deck
  currentPlayer.InitDeck();
  otherPlayer.InitDeck();
}

function AssignHand() {
  for (var i = 0; i < 4; i++) GrabCard();
}

function PassTurn() {
  SwitchPlayers();
  currentPlayer.canPlayCard = true;
  NextRound();
}

// Main Game Loop
function NextRound() {
  if (currentPlayer.holded && otherPlayer.holded) {
    EndSet();
    return;
  }

  // Add random card to player
  if (currentPlayer.holded) {
    PassTurn();
    return;
  } else {
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
  CreatePlayableCard(card, index);
}

function PlayCard(index) {
  // Play a card from hand
  console.log("Playing Card: " + index);
  if (currentPlayer.canPlayCard) {  
    var cardPlayed = currentPlayer.UseCardFromHand(index);
    CreateStaticCard(cardPlayed);
    RemovePlayableCard(index);
    UpdateUI();
  }
}

function HoldPlayer() {
  currentPlayer.holded = true;
  if (CanGameContinue()) PassTurn();
}

function CanGameContinue() {
  if (CheckIfPazaak() || CheckGameOver()) {
    LockButtons();
    EndSet();
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

function CheckWinner() {
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
}

function EndSet() {
  LockButtons();
  nextSetBtn.style.visibility = "visible";
  CheckWinner();
}

function MoveToNextSet() {
  // Set Finished, clean and move to next one
  CleanTables();
  currentPlayer.points = 0;
  currentPlayer.holded = false;
  currentPlayer.canPlayCard = true;
  otherPlayer.points = 0;
  otherPlayer.holded = false;
  otherPlayer.canPlayCard = true;
  playerHandText.textContent = currentPlayer.points;
  opponentHandText.textContent = otherPlayer.points;
  currentSet++;
  currentSetText.textContent = currentSet;

  nextSetBtn.style.visibility = "hidden";
  NextRound();
}

function EndGame() {
  // Game Finished, reset everything
  ResetGame();
}

function ResetGame() {
  console.log("Reseting game...");
  startGameBtn.style.visibility = "visible";
  holdBtn.disabled = true;

  CleanTables();
  CleanPlayerHand();

  console.log("All Game's params reset.");
}

function LockButtons() {
  holdBtn.disabled = true;
  passBtn.disabled = true;
}

function UnlockButtons() {
  holdBtn.disabled = false;
  passBtn.disabled = false;
}

function CreateStaticCard(card) {
  var cardImg = document.createElement("img");
  cardImg.setAttribute("class", "cardImg");
  cardImg.setAttribute("src", card.imgSrc);
  cardImg.setAttribute("alt", "Card");
  if (!currentPlayer.isAI) playerTableImgs.appendChild(cardImg);
  else opponentTableImgs.appendChild(cardImg);
  return cardImg;
}

function CreatePlayableCard(card, index) {
  var cardImg = document.createElement("img");
  cardImg.setAttribute("class", "cardImg");
  cardImg.setAttribute("src", card.imgSrc);
  cardImg.setAttribute("alt", "Card");
  cardImg.addEventListener("click", LaunchWithIndex, false);
  cardImg.pos = index;
  function LaunchWithIndex() {
    var index = Array.prototype.indexOf.call(playerCardsImgs.children, cardImg);
    PlayCard(index);
  }
  playerCardsImgs.appendChild(cardImg);
  return cardImg;
}

function RemovePlayableCard(index) {
  if (playerCardsImgs.hasChildNodes()) {
    playerCardsImgs.removeChild(playerCardsImgs.children[index]);
  }
}

function CleanPlayerHand() {
  if (playerCardsImgs.hasChildNodes()) {
    while (playerCardsImgs.firstChild)
      playerCardsImgs.removeChild(playerCardsImgs.firstChild);
  }
}

function CleanTables() {
  if (playerTableImgs.hasChildNodes()) {
    while (playerTableImgs.firstChild)
      playerTableImgs.removeChild(playerTableImgs.firstChild);
  }

  if (opponentTableImgs.hasChildNodes()) {
    while (opponentTableImgs.firstChild)
      opponentTableImgs.removeChild(opponentTableImgs.firstChild);
  }
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
