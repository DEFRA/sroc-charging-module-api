'use strict'

/**
 * @module StreamTransformCSVRowService
 */

const { Transform } = require('stream')

const ConvertToCSVService = require('../convert_to_csv.service.js')

/**
 * Returns a Transform stream which turns an incoming array into a CSV row, ie. comma-separated, with text elements
 * wrapped in double-quotes, any quote chars escaped and ending with a newline.
 *
 * @returns {TransformStream} A stream of data.
 */
class StreamTransformCSVRowService {
  static go () {
    return new Transform({
      objectMode: true,
      transform: function (array, _encoding, callback) {
        callback(null, ConvertToCSVService.go(array))
      }
    })
  }
}

module.exports = StreamTransformCSVRowService
