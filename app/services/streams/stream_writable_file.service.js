'use strict'

/**
 * @module StreamWritableFileService
 */

const fs = require('fs')

class StreamWritableFileService {
/**
 * Returns a Writable stream which writes data supplied to it to a file.
 *
 * @param {string} filenameWithPath The path and filename to be written to.
 * @param {boolean} [append] Whether incoming data should be appended to an existing file. Defaults to `false`.
 * @returns {WritableStream} A Writable stream.
 */
  static go (filenameWithPath, append = false) {
    return fs.createWriteStream(filenameWithPath, append ? { flags: 'a' } : {})
  }
}

module.exports = StreamWritableFileService
