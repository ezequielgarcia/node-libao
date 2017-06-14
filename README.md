node-ao
============
### Node.js libao bindings, output PCM data to the speakers.

A Writable stream instance that accepts PCM audio data and outputs it
to the speakers. The output is backed by `libao`'s audio output modules, which
in turn use any number of audio backends commonly found on Operating Systems
these days.

This module is very much based on the awesome node-speaker
(https://www.npmjs.com/package/speaker).

Installation
------------

Simply compile and install `node-ao` using `npm`:

``` bash
$ npm install speaker
```

You should install libao first.

A few examples
--------------

``` javascript
var Ao = require('ao');

// Create the Ao instance
var ao = new Ao({
  channels: 2,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: 44100     // 44,100 Hz sample rate
});

// PCM data from stdin gets piped into the speaker
process.stdin.pipe(ao);
```

``` javascript
var fs = require('fs');
var wav = require('wav');
var Ao = require('ao');

var file = fs.createReadStream(filepath);

var reader = new wav.Reader();
reader.on('format', function (format) {
  reader.pipe(new Ao(fmt));
});

file.pipe(reader);
```

API
---

`require('ao')` directly returns the `Ao` constructor. It is the only
interface exported by `node-ao`.

### new Ao([ format ]) -> Ao instance;

Creates a new `Ao` instance, which is a writable stream that you can pipe
PCM audio data to. The optional `format` object may contain any of the `Writable`
base class options, as well as any of these PCM formatting options:

  * `channels` - The number of audio channels. PCM data must be interleaved. Defaults to `2`.
  * `bitDepth` - The number of bits per sample. Defaults to `16` (16-bit).
  * `sampleRate` - The number of samples per second per channel. Defaults to `44100`.

#### "open" event

Fired when the backend `open()` call has completed. This happens once the first
`write()` call happens on the ao instance.

#### "close" event

Fired after the "flush" event, after the backend `close()` call has completed.
This ao instance is essentially finished after this point.
