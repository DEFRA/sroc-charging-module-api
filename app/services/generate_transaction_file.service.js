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
   * Generates and writes a transaction file to a given filename in the temp folder.
   *
   * @param {string} filename The name of the file to be generated.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (filename) {
    try {
      const filenameWithPath = path.join(temporaryFilePath, filename)
      const writeStream = await this._openStream(filenameWithPath)
      await this._writeToStream(writeStream)
      await this._closeStream(writeStream)

      return filenameWithPath
    } catch (error) {
      throw new Error(error)
    }
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
