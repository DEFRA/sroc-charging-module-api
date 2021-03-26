'use strict'

/**
 * @module StreamTransformCSVService
 */

const { Transform } = require('stream')

/**
 * Returns a Transform stream which turns an incoming array into a CSV row, ie. comma-separated ending with a newline.
 *
 * NOTE: Fields are not sanitised in any way.
 *
 * @returns {TransformStream} A stream of data.
 */
class StreamTransformCSVService {
  static go () {
    return new Transform({
      objectMode: true,
      transform: function (array, _encoding, callback) {
        const csv = array.join()

        callback(null, csv.concat('\n'))
      }
    })
  }
}

module.exports = StreamTransformCSVService
