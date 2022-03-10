import * as Utils from "./Utils/Utils.js";
import * as AIPlayer from "./AIPlayer.js";
import { Player } from "./Player.js";
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

let leftSets;
let rightSets;

let currentSet;
let mainDeckCards = [];

let cardsPath = "./img/Pazaak Cards/pazaakCards";

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
AssignParams();

function AssignParams() {
  console.log("Initiating game params...");
  gameStatusText = document.getElementById("statusText");
  currentSetText = document.getElementById("setText");
  playerHandText = document.getElementById("playerText");
  opponentHandText = document.getElementById("opponentText");

  leftSets = document.getElementById("leftSetDiv");
  rightSets = document.getElementById("rightSetDiv");

  endGameBtn.style.visibility = "hidden";
  nextSetBtn.style.visibility = "hidden";
  startGameBtn.style.visibility = "visible";
  HidePlayButtons();

  playerHandText.style.visibility = "visible";
  opponentHandText.style.visibility = "visible";
  console.log("Games params initiated.");
}

function InitGame() {
  startGameBtn.style.visibility = "hidden";
  endGameBtn.style.visibility = "visible";

  playerHandText.textContent = 0;
  opponentHandText.textContent = 0;

  currentSet = 1;
  currentSetText.textContent = currentSet;

  currentPlayer = new Player(false);
  otherPlayer = new Player(true);

  InitDecks();

  AssignHand();
  SwitchPlayers();
  AssignHand();
  SwitchPlayers();

  LockButtons();
  ShowPlayButtons();

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
      mainDeckCards.push(
        new Card(i, cardsPath + "D" + i + ".png", cardsPath + "0.png", Normal)
      );

  //Init players' deck
  currentPlayer.InitDeck(
    cardsPath,
    document.getElementById("playerCardsImg"),
    document.getElementById("playerTableImg")
  );
  otherPlayer.InitDeck(
    cardsPath,
    document.getElementById("opponentCardsImg"),
    document.getElementById("opponentTableImg")
  );
}

function AssignHand() {
  for (var i = 0; i < 4; i++) GrabCard();
}

function PassTurn() {
  LockButtons();
  SwitchPlayers();
  currentPlayer.canPlayCard = true;
  UpdateUI();
  NextRound();
}

// Main Game Loop
async function NextRound() {
  if (currentPlayer.holded && otherPlayer.holded) {
    EndSet();
    return;
  }
  // Add random card to player
  if (currentPlayer.holded) {
    PassTurn();
    return;
  }

  if (CheckIfPazaak() || CheckIfOver9()) {
    HoldPlayer();
    return;
  }

  AssignCardFromMainDeck(PlayersActions);
}

function PlayersActions() {
  if (CanGameContinue()) {
    if (!currentPlayer.isAI) UnlockButtons();
    else AITurn();
  }
}

async function AITurn() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const { action, playCardIndex } = AIPlayer.Decide(currentPlayer, otherPlayer);

  console.log("AI Action: " + action.valueOf().toString());

  switch (action) {
    case AIPlayer.Hold:
      HoldPlayer();
      break;
    case AIPlayer.Pass:
      PassTurn();
      break;
    case AIPlayer.PlayCard:
      PlayCard(playCardIndex);
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

async function AssignCardFromMainDeck(callback) {
  var card = GetRandomCardFromMainDeck();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  var cardImg = CreateStaticCard(card);
  currentPlayer.AddPonits(card.value);

  UpdateUI();

  if (CheckIfPazaak()) {
    HoldPlayer();
    return;
  }
  callback();
}
function GetRandomCardFromMainDeck() {
  return mainDeckCards.splice(
    Utils.GetRandomInt(0, mainDeckCards.length - 1),
    1
  )[0];
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
  if (currentPlayer.canPlayCard) {
    console.log("Playing Card: " + index);
    var cardPlayed = currentPlayer.UseCardFromHand(index);
    CreateStaticCard(cardPlayed);
    RemovePlayableCard(index);
    UpdateUI();

    if (currentPlayer.isAI) AITurn();
  }
}

function HoldPlayer() {
  currentPlayer.holded = true;
  if (CanGameContinue()) PassTurn();
}

function CanGameContinue() {
  if (CheckIfDoublePazaak() || CheckGameOver()) {
    LockButtons();
    EndSet();
    return false;
  }
  return true;
}

function CheckIfOver9() {
  return currentPlayer.tableRef.children.length >= 9;
  // if (!currentPlayer.isAI) return currentPlayer.tableRef.children.length >= 9;
  // else return opponentTableImgs.children.length >= 9;
}

function CheckIfPazaak() {
  return currentPlayer.points === 20;
}

function CheckIfDoublePazaak() {
  return currentPlayer.points === 20 && otherPlayer.points === 20;
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
    gameStatusText.textContent = "Tied Set";
  else if (currentPlayer.points === 20 || otherPlayer.points > 20) {
    AddSetWin(currentPlayer, leftSets);
    gameStatusText.textContent = "You win this set!";
  } else if (otherPlayer.points === 20 || currentPlayer.points > 20) {
    AddSetWin(otherPlayer, rightSets);
    gameStatusText.textContent = "Your oponent wins this set...";
  } else {
    // Check closest to 20
    let winner = Utils.GetClosestTo(
      20,
      currentPlayer.points,
      otherPlayer.points
    );
    if (winner === currentPlayer.points) {
      AddSetWin(currentPlayer, leftSets);
      gameStatusText.textContent = "You win this set!";
    } else {
      AddSetWin(otherPlayer, rightSets);
      gameStatusText.textContent = "Your oponent wins this set...";
    }
  }
}

function AddSetWin(player, setDiv)
{
  player.setsWon++;
  setDiv.children[player.setsWon - 1].style.backgroundColor = "red";
}

function CheckFinishGame() {
  if (currentPlayer.setsWon < 3 && otherPlayer.setsWon < 3) return false;
  if (currentPlayer.setsWon === 3 && otherPlayer.setsWon === 3) return false;

  if (currentPlayer.setsWon > otherPlayer.setsWon)
    gameStatusText.textContent = "You win the Game!";
  else gameStatusText.textContent = "Your oponent wins the Game...";

  endGameBtn.textContent = "Play Again";
  endGameBtn.style.visibility = "visible";
  startGameBtn.style.visibility = "hidden";

  HidePlayButtons();

  return true;
}

function EndSet() {
  LockButtons();
  CheckWinner();
  if (!CheckFinishGame()) nextSetBtn.style.visibility = "visible";
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
  endGameBtn.textContent = "Exit Game";
  endGameBtn.style.visibility = "hidden";
  startGameBtn.style.visibility = "visible";
  nextSetBtn.style.visibility = "hidden";
  HidePlayButtons();

  gameStatusText.textContent = "Welcome";
  playerHandText.textContent = "";
  opponentHandText.textContent = "";
  currentSetText.textContent = "";

  CleanTables();
  CleanHands();

  console.log("All Game's params reset.");
}

function LockButtons() {
  HideCards();
  holdBtn.disabled = true;
  passBtn.disabled = true;
}

function ShowPlayButtons() {
  holdBtn.style.visibility = "visible";
  passBtn.style.visibility = "visible";
}

function UnlockButtons() {
  ShowCards();
  holdBtn.disabled = false;
  passBtn.disabled = false;
}

function HidePlayButtons() {
  holdBtn.style.visibility = "hidden";
  passBtn.style.visibility = "hidden";
}

function CreateStaticCard(card) {
  var cardImg = document.createElement("img");
  cardImg.setAttribute("class", "cardImg");
  cardImg.setAttribute("src", card.imgSrc);
  cardImg.setAttribute("alt", "Card");
  currentPlayer.tableRef.appendChild(cardImg);
  // if (!currentPlayer.isAI) playerTableImgs.appendChild(cardImg);
  // else opponentTableImgs.appendChild(cardImg);
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
    var index = Array.prototype.indexOf.call(
      currentPlayer.handRef.children,
      cardImg
    );
    PlayCard(index);
  }
  currentPlayer.handRef.appendChild(cardImg);

  // if (!currentPlayer.isAI) playerCardsImgs.appendChild(cardImg);
  // else opponentCardsImgs.appendChild(cardImg);
  return cardImg;
}

function RemovePlayableCard(index) {
  if (currentPlayer.handRef.hasChildNodes()) {
    currentPlayer.handRef.removeChild(currentPlayer.handRef.children[index]);
  }
}

function CleanHands() {
  if (currentPlayer.handRef.hasChildNodes()) {
    while (currentPlayer.handRef.firstChild)
      currentPlayer.handRef.removeChild(currentPlayer.handRef.firstChild);
  }

  if (otherPlayer.handRef.hasChildNodes()) {
    while (otherPlayer.handRef.firstChild)
      otherPlayer.handRef.removeChild(otherPlayer.handRef.firstChild);
  }
}

function CleanTables() {
  if (currentPlayer.tableRef.hasChildNodes()) {
    while (currentPlayer.tableRef.firstChild)
      currentPlayer.tableRef.removeChild(currentPlayer.tableRef.firstChild);
  }

  if (otherPlayer.tableRef.hasChildNodes()) {
    while (otherPlayer.tableRef.firstChild)
      otherPlayer.tableRef.removeChild(otherPlayer.tableRef.firstChild);
  }
}

function ShowCards() {
  currentPlayer.handRef.style.visibility = "visible";
  otherPlayer.handRef.style.visibility = "visible";
}

function HideCards() {
  currentPlayer.handRef.style.visibility = "hidden";
  otherPlayer.handRef.style.visibility = "hidden";
}

function UpdateUI() {
  if (!currentPlayer.isAI) {
    gameStatusText.textContent = "Your Turn";
    playerHandText.textContent = currentPlayer.points;
  } else {
    gameStatusText.textContent = "Opponent's Turn";
    opponentHandText.textContent = currentPlayer.points;
  }
}
