import { Normal } from "./Card.js";
import * as Utils from "./Utils/Utils.js";

export const Hold = Symbol("hold");
export const PlayCard = Symbol("play");
export const Pass = Symbol("pass");

const yourFunction = async () => {};

export function Decide(AIPlayer, OpponentPlayer) {
  let difference = 20 - AIPlayer.points;

  // Check if already played in this round
  if (AIPlayer.canPlayCard) {
    if (difference >= 10) {
      return { action: Pass };
    } else {
      if (difference < 3) {
        var plusCard = GetCard(AICards, 1);
        if (plusCard != undefined)
          return { action: PlayCard, playCardIndex: plusCard };
        else {
          //Cannot use card, Pass or Hold depending of opponent's points
          if (AIPlayer.points < OpponentPlayer.points) return { action: Pass };
          else return { action: Hold };
        }
      }

      // (25%) -- Use -1 card
      if (Utils.GetRandomInt(1, 100) <= 25) {
        var minusCard = GetCard(AICards, -1);
        if (minusCard != undefined)
          return { action: PlayCard, playCardIndex: minusCard };
      }

      // Pass or Hold depending on opponent points and status
      if (AIPlayer.points < OpponentPlayer.points) return { action: Pass };
      else 
      {
        if (OpponentPlayer.holded) return { action: Hold };
        else return { action: Pass };
      }
    }
  } else {
    if (difference < 3) {
      return {
        action: Hold,
      };
    } else {
      return {
        action: Pass,
      };
    }
  }

  if (AIPlayer.canPlayCard) {
    var plusCard = GetCard(AIPlayer.handCards, 1);
    if (plusCard != undefined)
      return { action: PlayCard, playCardIndex: plusCard };
    else return { action: Pass };
  } else {
    if (difference < 3) {
      return {
        action: Hold,
      };
    } else {
      return {
        action: Pass,
      };
    }
  }
}

function GetCard(AICards, value) {
  for (var i = 0; i < AICards.length; i++) {
    if (AICards[i].type === Normal && AICards[i].value === value) return i;
  }
  return undefined;
}
