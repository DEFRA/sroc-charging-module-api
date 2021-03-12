'use strict'

/**
 * @module GenerateTransactionFileService
 */

const fs = require('fs')
const path = require('path')
const stream = require('stream')
const util = require('util')
const { temporaryFilePath } = require('../../config/server.config')

const finished = util.promisify(stream.finished)

class GenerateTransactionFileService {
  /**
   * Writes a file to a given filename in the temp folder.
   *
   * @param {string} filename The name of the file to be written.
   * @param {function} notify The server.methods.notify method, which we pass in as server.methods isn't accessible
   * within a service.
   * @returns {string} The path and filename of the written file.
   */
  static async go (filename, notify) {
    const filenameWithPath = path.join(temporaryFilePath, filename)
    const writeStream = await this._openStream(filenameWithPath)

    try {
      await this._writeToStream(writeStream)
      await this._closeStream(writeStream)
    } catch (error) {
      notify(`Error writing file ${filenameWithPath}: ${error}`)
    }

    return filenameWithPath
  }

  static async _openStream (filenameWithPath) {
    return fs.createWriteStream(filenameWithPath)
  }

  static async _writeToStream (writeStream) {
    await writeStream.write('Hello world!')
  }

  static async _closeStream (writeStream) {
    writeStream.end()
    await finished(writeStream)
  }
}

module.exports = GenerateTransactionFileService
