'use strict'

/**
 * @module StreamTransformDatRowService
 */

const { Transform } = require('stream')

/**
 * Returns a Transform stream which turns an incoming array into a dat row, ie. comma-separated, with each element
 * wrapped in double quotes, and ending with a newline.
 *
 * @returns {TransformStream} A stream of data.
 */
class StreamTransformDatRowService {
  static go () {
    return new Transform({
      objectMode: true,
      transform: function (array, _encoding, callback) {
        const datRow = array
          .map(element => `"${element}"`)
          .join()
          .concat('\n')

        callback(null, datRow)
      }
    })
  }
}

module.exports = StreamTransformDatRowService
