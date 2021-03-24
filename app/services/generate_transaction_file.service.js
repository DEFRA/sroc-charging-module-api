'use strict'

/**
 * @module GenerateTransactionFileService
 */

const fs = require('fs')
const path = require('path')
const { pipeline, Readable, Transform } = require('stream')
const util = require('util')
const { temporaryFilePath } = require('../../config/server.config')

class GenerateTransactionFileService {
  /**
   * Generates and writes a transaction file to a file in the temp folder. The filename will be the bill run's file
   * reference with '.dat' appended, ie. 'nalai50001.dat'
   *
   * @param {string} fileReference The bill run's file reference.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (fileReference) {
    const filenameWithPath = this._filenameWithPath(fileReference)

    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      this._inputStream(),
      this._transformStream(),
      this._writeToFileStream(filenameWithPath)
    )

    return filenameWithPath
  }

  static _filenameWithPath (fileReference) {
    // We use path.normalize to remove any double forward slashes that occur when assembling the path
    return path.normalize(
      path.format({
        dir: temporaryFilePath,
        name: fileReference,
        ext: '.dat'
      })
    )
  }

  /**
   * Wrap stream.pipeline in a promise so we can easily 'await' it.
   */
  static _promisifiedPipeline () {
    return util.promisify(pipeline)
  }

  /**
   * Create a stream that reads each transaction, translates it, and outputs it
   */
  static _inputStream () {
    return new Readable({
      read () {
        this.push('Hello world!')

        // Return null to signify end of data
        this.push(null)
      }
    })
  }

  static _transformStream () {
    return new Transform({
      transform (chunk, _encoding, callback) {
        const upperCaseText = chunk.toString().toUpperCase()

        // First argument of callback is an error object if applicable
        // Second argument is data to be passed along
        callback(null, upperCaseText)
      }
    })
  }

  /**
   * Create a stream that writes to a given file
   */
  static _writeToFileStream (filenameWithPath) {
    return fs.createWriteStream(filenameWithPath)
  }
}

module.exports = GenerateTransactionFileService
