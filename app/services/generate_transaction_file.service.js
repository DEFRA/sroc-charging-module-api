'use strict'

/**
 * @module GenerateTransactionFileService
 */

const fs = require('fs')
const path = require('path')
const { Readable, Transform } = require('stream')
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
    const inputStream = this._inputStream()
    const transformStream = this._transformStream()
    await this._streamToFile(inputStream, transformStream, filenameWithPath)

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
   * Accept a stream and pipe it to a file. We wrap this in a promise to streamline event handling. The method returns
   * a promise so we can simply call it using "await" to wait for it to complete before we continue.
   *
   * https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka
   */
  static _streamToFile (inputStream, transformStream, filePath) {
    return new Promise((resolve, reject) => {
      const fileWriteStream = fs.createWriteStream(filePath)
      inputStream
        .pipe(transformStream)
        .pipe(fileWriteStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  }

  /**
   * Create a stream that reads each transaction, translates it, and outputs it
   */
  static _inputStream () {
    const stream = new Readable({
      read () {
        this.push('Hello world!')

        // Return null to signify end of data
        this.push(null)
      }
    })

    return stream
  }

  static _transformStream () {
    const stream = new Transform({
      transform (chunk, _encoding, callback) {
        this.push(chunk.toString().toUpperCase())
        callback()
      }
    })

    return stream
  }
}

module.exports = GenerateTransactionFileService
