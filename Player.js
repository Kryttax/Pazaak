import { Card, Normal, PlusMinus } from "./Card.js";

export class Player {
  holded = false;
  points = 0;
  setsWon = 0;
  isAI = false;
  canPlayCard = true;
  deckCards = [];
  handCards = [];
  tableRef;
  handRef;

  constructor(isAI) {
    this.isAI = isAI;
  }

  InitDeck(cardsPath, handRef, tableRef) {
    this.handRef = handRef;
    this.tableRef = tableRef;

    for (let pos = 0; pos < 3; pos++)
      this.deckCards.push(new Card(1, cardsPath + "1.png", cardsPath + "0.png", Normal));
    for (let neg = 0; neg < 3; neg++)
      this.deckCards.push(new Card(-1, cardsPath + "-1.png", cardsPath + "0.png", Normal));

    // if (this.isAI) {
    //   for (let pos = 0; pos < 3; pos++)
    //     this.deckCards.push(new Card(1, cardsPath + "0.png", Normal));
    //   for (let neg = 0; neg < 3; neg++)
    //     this.deckCards.push(new Card(-1, cardsPath + "0.png", Normal));
    // } else {
    //   for (let pos = 0; pos < 3; pos++)
    //     this.deckCards.push(new Card(1, cardsPath + "1.png", Normal));
    //   for (let neg = 0; neg < 3; neg++)
    //     this.deckCards.push(new Card(-1, cardsPath + "-1.png", Normal));
    // }
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

export default Player;
