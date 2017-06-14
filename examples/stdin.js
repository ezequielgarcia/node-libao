
/**
 * Pipe data to stdin and it will be played through your speakers.
 */

var Ao = require('../');

var ao = new Ao();
process.stdin.pipe(ao);
