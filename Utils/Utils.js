/**
 * Returns a random number between min and max, both inclusive.
 * @param min First number of the random generation.
 * @param max Last number of the random generation.
 */
export function GetRandomInt(min, max) {
  max += 1;
  return Math.floor(Math.random() * (max - min)) + min;
}

export function GetClosestTo(targetNum, num1, num2)
{
  if(num1 > targetNum)
    return;
  if(num2 > targetNum)
    return;

  let first = targetNum - num1;
  let second = targetNum - num2;

  return (20 - Math.min(first, second));
}
