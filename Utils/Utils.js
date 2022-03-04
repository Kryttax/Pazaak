/**
 * Returns a random number between min and max, both inclusive.
 * @param min First number of the random generation.
 * @param max Last number of the random generation.
 */
function getRandomInt(min, max) {
  max += 1;
  return Math.floor(Math.random() * (max - min)) + min;
}
