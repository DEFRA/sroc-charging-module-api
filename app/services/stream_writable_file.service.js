'use strict'

/**
 * @module StreamWritableFileService
 */

const fs = require('fs')

/**
 * Returns a Writable stream which writes data supplied to it to a file.
 *
 * @param {string} filenameWithPath The path and filename to be written to.
 * @param {boolean} [append] Whether incoming data should be appended to an existing file. Defaults to `false`.
 * @returns {WritableStream} A Writable stream.
 */

/**
   * Writable stream that writes to a given file. Defaults to overwriting the content of the existing file; pass 'true'
   * as the second parameter to append the data instead.
   */
class StreamWritableFileService {
  static go (filenameWithPath, append = false) {
    return fs.createWriteStream(filenameWithPath, append ? { flags: 'a' } : {})
  }
}

module.exports = StreamWritableFileService
