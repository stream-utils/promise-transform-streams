
# promise-transform-streams

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Gittip][gittip-image]][gittip-url]

Creates promise-based transform streams.
`.map()` creates a stream that converts objects to promises.
`.resolve()` resolves all these promises.

The main use-case for this is to create "concurrent" transform that preserve order.
This module does not apply any concurrent limits!
However, you could play with the buffer sizes,
which indirectly relate to concurrency in this context.

## Example

Suppose you have MongoDB documents that look like this:

```js
var post = {
  creator_id: ObjectId('123412341234123412341234'),
  title: 'some title',
  markdown: 'blah'
}
```

You want to grab all the `.creator`s, but you still want to stream all the results.
Here's how to do it:

```js
var PStream = require('promise-transform-stream')

db.posts.find({}).stream()
// get the creator of each post, returns a stream of promises
.pipe(PStream.map(getCreator))
// resolves each promise in the stream in order
.pipe(PStream.resolve())
// no we can serialize the results and send it to the client!
.pipe(JSONStream.stringify())
.pipe(zlib.createGzip())
.pipe(res)

function getCreator(post) {
  return new Promise(function (resolve, reject) {
    db.users.findOne({
      _id: post.creator_id
    }, function (err, user) {
      if (err) return reject(err)
      post.creator = user
      resolve(post)
    })
  })
}
```

To be more efficient, you'd probably want to query each `creator_id` once per request.

## API

### .create(transform, [flush])

Create a new `Transform` constructor with `._transform` and `._flush` methods.
`transform` should resolve to the mapped document.
`flush` should not have any arguments.

```js
var Transform = PStream.create(function (doc) {
  return Promise.resolve(doc)
})

db.posts.find({}).stream()
.pipe(Transform())
```

### .map(transform, [flush])

The same as `.create()`, except it returns the transform instance immediately,
[through2](https://www.npmjs.com/package/through2)-style.
This is not recommended!

### .resolve([options])

Returns a resolving transform stream.

[gitter-image]: https://badges.gitter.im/stream-utils/promise-transform-streams.png
[gitter-url]: https://gitter.im/stream-utils/promise-transform-streams
[npm-image]: https://img.shields.io/npm/v/promise-transform-streams.svg?style=flat-square
[npm-url]: https://npmjs.org/package/promise-transform-streams
[github-tag]: http://img.shields.io/github/tag/stream-utils/promise-transform-streams.svg?style=flat-square
[github-url]: https://github.com/stream-utils/promise-transform-streams/tags
[travis-image]: https://img.shields.io/travis/stream-utils/promise-transform-streams.svg?style=flat-square
[travis-url]: https://travis-ci.org/stream-utils/promise-transform-streams
[coveralls-image]: https://img.shields.io/coveralls/stream-utils/promise-transform-streams.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/stream-utils/promise-transform-streams
[david-image]: http://img.shields.io/david/stream-utils/promise-transform-streams.svg?style=flat-square
[david-url]: https://david-dm.org/stream-utils/promise-transform-streams
[license-image]: http://img.shields.io/npm/l/promise-transform-streams.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/promise-transform-streams.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/promise-transform-streams
[gittip-image]: https://img.shields.io/gratipay/jonathanong.svg?style=flat-square
[gittip-url]: https://gratipay.com/jonathanong/
