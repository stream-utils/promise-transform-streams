
var Transform = require('readable-stream/transform')
var Promise = require('native-or-bluebird')
var inherits = require('util').inherits
var assert = require('assert')

/**
 * Create a new transform constructor.
 */

exports.create = function (transform, flush) {
  assert(typeof transform === 'function')

  inherits(Stream, Transform)

  function Stream(options) {
    if (!(this instanceof Stream)) return new Stream(options)
    Transform.call(this, options)
    // always object mode!
    this._readableState.objectMode =
    this._writableState.objectMode = true
  }

  Stream.prototype._transform = function (doc, NULL, cb) {
    cb(null, Promise.resolve(transform.call(this, doc)))
  }

  if (typeof flush === 'function') {
    // TODO: assert that flush doesn't have any arguments
    Stream.prototype._flush = function (cb) {
      Promise.resolve(flush.call(this)).then(cb.bind(null, null), cb)
    }
  }

  return Stream
}

/**
 * Create a new transform instance, `through`-style.
 * NOT RECOMMENDED!
 */

exports.map = function (transform, flush) {
  return exports.create(transform, flush)()
}

/**
 * Create a transform stream that resolves all the promises.
 */

exports.resolve = Resolve

inherits(Resolve, Transform)

function Resolve(options) {
  if (!(this instanceof Resolve)) return new Resolve(options)
  Transform.call(this, options)
  // always object mode!
  this._readableState.objectMode =
  this._writableState.objectMode = true
}

Resolve.prototype._transform = function (doc, NULL, cb) {
  Promise.resolve(doc).then(cb.bind(null, null)).catch(cb)
}
