
var Promise = require('native-or-bluebird')
var toArray = require('stream-to-array')
var assert = require('assert')

var PStream = require('..')

it('should compose', function () {
  var stream = PStream.map(function (doc) {
    return new Promise(function (resolve) {
      process.nextTick(function () {
        doc.asdf = true
        resolve(doc)
      })
    })
  }, function () {
    this.push({
      c: 3,
      asdf: true
    })
  })

  stream.write({
    a: 1
  })

  stream.write({
    b: 2
  })

  stream.end()

  return toArray(stream.pipe(PStream.resolve())).then(function (arr) {
    assert(arr.length === 3)
    arr.forEach(function (arr) {
      assert(arr.asdf)
    })
  })
})
