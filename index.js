
/**
 * Module dependencies.
 */

var os = require('os');
var debug = require('debug')('ao');
var binding = require('bindings')('binding');
var inherits = require('util').inherits;
var Writable = require('readable-stream/writable');

/**
 * Module exports.
 */

exports = module.exports = libao;

/**
 * The `libao` class accepts raw PCM data written to it, and then sends that data
 * to the default output device of the OS.
 *
 * @param {Object} opts options object
 * @api public
 */

function libao (opts) {
  if (!(this instanceof libao)) return new libao(opts);

  // default lwm and hwm to 0
  if (!opts) opts = {};
  if (!opts.lowWaterMark) opts.lowWaterMark = 0;
  if (!opts.highWaterMark) opts.highWaterMark = 0;

  Writable.call(this, opts);

  // the `ao_device` pointer Buffer instance
  this._audio_handle = null;

  // flipped after close() is called, no write() calls allowed after
  this._closed = false;

  // set PCM format
  this._format(opts);

  // bind event listeners
  this._format = this._format.bind(this);
  this.on('pipe', this._pipe);
  this.on('unpipe', this._unpipe);
}
inherits(libao, Writable);

/**
 * Calls the audio backend's `open()` function, and then emits an "open" event.
 *
 * @api private
 */

libao.prototype._open = function () {
  debug('open()');
  if (this._audio_handle) {
    throw new Error('_open() called more than once!');
  }
  // set default options, if not set
  if (!this.channels) {
    debug('setting default %o: %o', 'channels', 2);
    this.channels = 2;
  }
  if (!this.bitDepth) {
    debug('setting default %o: %o', 'bitDepth', 32);
    this.bitDepth = 32;
  }
  if (!this.sampleRate) {
    debug('setting default %o: %o', 'sampleRate', 44100);
    this.sampleRate = 44100;
  }
  // initialize the audio handle
  this._audio_handle = binding.open(this.channels, this.sampleRate, this.bitDepth);
  if (!this._audio_handle) {
    throw new Error('open() failed');
  }
  this.emit('open');
  return this._audio_handle;
};

/**
 * Set given PCM formatting options. Called during instantiation on the passed in
 * options object, on the stream given to the "pipe" event, and a final time if
 * that stream emits a "format" event.
 *
 * @param {Object} opts
 * @api private
 */

libao.prototype._format = function (opts) {
  debug('format(object keys = %o)', Object.keys(opts));
  if (opts.channels) {
    debug('setting %o: %o', 'channels', opts.channels);
    this.channels = opts.channels;
  }
  if (opts.bitDepth) {
    debug('setting %o: %o', "bitDepth", opts.bitDepth);
    this.bitDepth = opts.bitDepth;
  }
  if (opts.sampleRate) {
    debug('setting %o: %o', "sampleRate", opts.sampleRate);
    this.sampleRate = opts.sampleRate;
  }
};

/**
 * `_write()` callback for the Writable base class.
 *
 * @param {Buffer} chunk
 * @param {String} encoding
 * @param {Function} done
 * @api private
 */

libao.prototype._write = function (chunk, encoding, done) {
  debug('_write() (%o bytes)', chunk.length);

  if (this._closed) {
    // close() has already been called. this should not be called
    return done(new Error('write() call after close() call'));
  }
  var handle = this._audio_handle;
  if (!handle) {
    // this is the first time write() is being called; need to _open()
    try {
      handle = libao.prototype._open.call(this);
    } catch (e) {
      return done(e);
    }
  }

  if (this._closed) {
    debug('aborting remainder of write() call (%o bytes), since module is `_closed`', left.length);
    return done();
  }

  binding.write(handle, chunk, chunk.length, function onwrite(r) {
    if (!r) {
      done(new Error('write() failed: ' + r));
    } else {
      debug('write successful');
      done();
    }
  });
};

/**
 * Called when this stream is pipe()d to from another readable stream.
 * If the "sampleRate", "channels" and "bitDepth" properties are
 * set, then they will be used over the currently set values.
 *
 * @api private
 */

libao.prototype._pipe = function (source) {
  debug('_pipe()');
  this._format(source);
  source.once('format', this._format);
};

libao.prototype._unpipe = function (source) {
  debug('_unpipe()');
  source.removeListener('format', this._format);
};

/**
 * Closes the audio backend.
 *
 * @api public
 */

libao.prototype.close = function () {
  debug('close()');
  if (this._closed) return debug('already closed...');

  if (this._audio_handle) {
    debug('invoking close() native binding');
    binding.close(this._audio_handle);
    this._audio_handle = null;
  } else {
    debug('not invoking close() bindings since no `_audio_handle`');
  }

  this._closed = true;
  this.emit('close');
};
