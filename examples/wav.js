var fs = require('fs');
var wav = require('wav');
var os = require('os');
var libao = require('../');
var program = require('commander');

program.parse(process.argv);

function playFile(filepath) {
	var file = fs.createReadStream(filepath);
	var reader = new wav.Reader();
	reader.on('format', function (format) {
		ao = new libao(format);
		ao.on('unpipe', () => {
			console.log('Done ' + filepath);
		});
		reader.pipe(ao);
	});
	file.pipe(reader);
	console.log('Started playing ' + filepath);
}
program.args.forEach(playFile);
