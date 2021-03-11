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
  static async go (filename) {
    const filenameWithPath = path.join(temporaryFilePath, filename)

    const stream = await this._openStream(filenameWithPath)
    await this._writeToStream(stream)
    await this._closeStream(stream)

    return filenameWithPath
  }

  static async _openStream (filenameWithPath) {
    return fs.createWriteStream(filenameWithPath)
  }

  static async _writeToStream (stream) {
    await stream.write('Hello world!')
  }

  static async _closeStream (stream) {
    stream.end()
    await finished(stream)
  }
}

module.exports = GenerateTransactionFileService
