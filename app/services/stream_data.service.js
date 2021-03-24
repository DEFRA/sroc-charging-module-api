'use strict'

/**
 * @module StreamDataService
 */

const { Readable } = require('stream')

/**
 * Returns the data passed to it as a stream containing a single 'chunk'.
 *
 * Note that the data is passed to Readable in an array, as Readable requires an Iterable.
 *
 * @param {object} data Data object to be streamed back.
 * @returns {ReadableStream} A stream of data.
 */
class StreamDataService {
  static go (data) {
    return Readable
      .from([data])
  }
}

module.exports = StreamDataService
