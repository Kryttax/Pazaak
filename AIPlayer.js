export const Hold = Symbol("hold");
export const PlayCard = Symbol("play");
export const Pass = Symbol("pass");
const yourFunction = async () => {};

export function Decide(AIPoints) {
  let difference = 20 - AIPoints;
  
  if (difference > 6) {
    return Pass;
  } else return Hold;
}


function ThinkTime(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}