node-libao
============
### Node.js libao bindings, output PCM data to the speakers.

+[![Build Status](https://travis-ci.org/ezequielgarcia/node-libao.svg?branch=master)](https://travis-ci.org/ezequielgarcia/node-libao#)

A Writable stream instance that accepts PCM audio data and outputs it
to the speakers. The output is backed by [libao][ao], which supports
a ton of audio backends.

This module is very much based on the awesome [node-speaker][speaker].

Installation
------------

You need `libao` installed on your system before installig `node-libao`.

- Debian
``` bash
$ apt-get install libao-dev
```

- OSX:
``` bash
$ brew install libao
```

Now, simply compile and install `node-libao` using `npm`:

``` bash
$ npm install libao
```

A few examples
--------------

``` javascript
var libao = require('libao');

// Create the libao instance
var ao = new libao({
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
var libao = require('libao');

var file = fs.createReadStream(filepath);

var reader = new wav.Reader();
reader.on('format', function (format) {
  reader.pipe(new libao(fmt));
});

file.pipe(reader);
```

API
---

`require('libao')` directly returns the `libao` constructor. It is the only
interface exported by the module.

### new libao([ format ]) -> libao instance;

Creates a new `libao` instance, which is a writable stream that you can pipe
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

[speaker]: https://www.npmjs.com/package/speaker
[ao]: https://www.xiph.org/ao/
