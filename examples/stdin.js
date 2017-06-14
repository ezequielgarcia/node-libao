
/**
 * Pipe data to stdin and it will be played through your speakers.
 */

var libao = require('../');

var ao = new libao();
process.stdin.pipe(ao);
