import Utils from "./Utils/Utils";

let handSum = 0;

let startGameBtn;
let grabCardBtn;
let holdBtn;

let gameStatusText;

let playerHandText;
let opponentHandText;

const Player1 = Symbol("Human");
const Player2 = Symbol("Opponent");

let playerCards = [1, 1, 1, -1, -1, -1];
let opponentCards = [1, 1, 1, -1, -1, -1];
let deckCards = [];

let playerHand = [];
let opponenthand = [];

let playerHold = false;
let opponentHold = false;

class Player {
  holded = false;
  points = 0;
  isAI = false;
  deckCards = [1, 1, 1, -1, -1, -1];
  handCards = [];

  AddPonits(points) {
    this.points += points;
  }
  AddCardToHand(card) {
    this.handCards.push(card);
  }
  RemoveCardFromHand(index) {
    return this.handCards.splice(index, 1)[0];
  }

  AddCardToDeck() {}
  RemoveCardFromDeck(index) {
    return this.deckCards.splice(index, 1)[0];
  }
}

let currentPlayer = new Player();
let otherPlayer = new Player();

function InitGame() {
  console.log("Initiating game params...");
  startGameBtn = document.getElementById("start");
  grabCardBtn = document.getElementById("grab");
  holdBtn = document.getElementById("hold");

  gameStatusText = document.getElementById("statusText");
  playerHandText = document.getElementById("playerText");
  opponentHandText = document.getElementById("opponentText");

  startGameBtn.style.visibility = "hidden";
  grabCardBtn.style.visibility = "visible";
  holdBtn.style.visibility = "visible";

  playerHandText.style.visibility = "visible";
  opponentHandText.style.visibility = "visible";

  InitDeck();
  otherPlayer.isAI = true;
  console.log("Games params initiated.");
  StartGame();
}

function StartGame() {
  console.log("Starting game...");
  NextRound();
}

function InitDeck() {
  // Main Deck  -- 40 cards, 4 of each (1-10)
  for (let i = 1; i <= 10; i++) for (let j = 0; j < 4; j++) deckCards.push(i);
}

function NextRound() {
  // Add random card to player
  if (currentPlayer.holded) SwitchPlayers();
  else {
    AssignCardFromMainDeck();
  }
}

function SwitchPlayers() {
  let auxPlayer = currentPlayer;
  currentPlayer = otherPlayer;
  otherPlayer = auxPlayer;
}

function AssignCardFromMainDeck() {
  currentPlayer.AddPonits(GetRandomCardFromMainDeck());
}

function GetRandomCardFromMainDeck() {
  return deckCards.splice(Utils.getRandomInt(0, deckCards.length - 1), 1)[0];
}

function GetRandomCardFromPlayerDeck() {
  return currentPlayer.RemoveCardFromDeck(
    Utils.getRandomInt(0, currentPlayer.playerDeck.length - 1)
  );
}

function GrabCard() {
  currentPlayer.AddCardToHand(GetRandomCardFromPlayerDeck());
  CheckGameStatus();
}

function HoldPlayer() {
  currentPlayer.holded = true;
  CheckGameStatus();
}

function CheckGameStatus() {
  if (CheckIfPazaak()) BlockButtons();

  if (CheckGameOver()) EndGame();
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

  if (currentPlayer.points === 20 && otherPlayer.points === 20)
    gameStatusText = "Both players win!";
  else if (currentPlayer.points > 20) ResetGame();
}

function ResetGame() {
  console.log("Ending game...");
  startGameBtn.style.visibility = "visible";
  grabCardBtn.style.visibility = "hidden";
  holdBtn.style.visibility = "hidden";
  grabCardBtn.disabled = "enabled";
  holdBtn.disabled = "enabled";

  playerHandText.style.visibility = "hidden";
  opponentHandText.style.visibility = "hidden";
  console.log("Game ended.");
}

function BlockButtons() {
  grabCardBtn.disabled = "disabled";
  holdBtn.disabled = "disabled";
}
