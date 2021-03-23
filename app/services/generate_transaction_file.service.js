'use strict'

/**
 * @module GenerateTransactionFileService
 */

const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const { temporaryFilePath } = require('../../config/server.config')

class GenerateTransactionFileService {
  /**
   * Generates and writes a transaction file to a given filename in the temp folder.
   *
   * @param {string} filename The name of the file to be generated.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (filename) {
    const filenameWithPath = path.join(temporaryFilePath, filename)
    const inputStream = this._inputStream()
    await this._streamToFile(inputStream, filenameWithPath)

    return filenameWithPath
  }

  /**
   * Accept a stream and pipe it to a file. We wrap this in a promise to streamline event handling. The method returns
   * a promise so we can simply call it using "await" to wait for it to complete before we continue.
   *
   * https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka
   */
  static _streamToFile (inputStream, filePath) {
    return new Promise((resolve, reject) => {
      const fileWriteStream = fs.createWriteStream(filePath)
      inputStream
        .pipe(fileWriteStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  }

  /**
   * Implement a simple readable stream to return our 'Hello world!' string.
   *
   * https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/#implement-a-readable-stream
   */
  static _inputStream () {
    const stream = new Readable({
      read () {}
    })

    stream.push('Hello world!')
    stream.push(null) // No more data

    return stream
  }
}

module.exports = GenerateTransactionFileService
