'use strict'

/**
 * @module TransformRecordsToFileService
 */

const fs = require('fs')
const path = require('path')
const { pipeline, Readable, Transform } = require('stream')
const util = require('util')
const { temporaryFilePath } = require('../../config/server.config')
const StreamRecordsService = require('./stream_records.service')

class TransformRecordsToFileService {
  /**
   * Generates and writes a transaction file to a file in the temp folder. The filename will be the bill run's file
   * reference with '.dat' appended, ie. 'nalai50001.dat'
   *
   * @param {string} fileReference The bill run's file reference.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (billRun, query, headerPresenter, bodyPresenter, footerPresenter, fileReference) {
    const filenameWithPath = this._filenameWithPath(fileReference)

    await this._writeHeader(billRun, headerPresenter, filenameWithPath)
    await this._writeBody(query, bodyPresenter, filenameWithPath)
    await this._writeFooter(billRun, footerPresenter, filenameWithPath)

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
   * Transforms a stream of data and writes it to a file in CSV format. Intended to be used to write a "section" of a
   * file, ie. header, body or footer.
   *
   * @param {ReadableStream} inputStream The stream of data to be written.
   * @param {module:Presenter} presenter The presenter to use to transform the data.
   * @param {string} filenameWithPath The filename and path to be written to.
   * @param {boolean} [append] Whether data should be appended to the file. Default is `false` ie. overwrite.
   */
  static async _writeSection (inputStream, presenter, filenameWithPath, append = false) {
    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      inputStream,
      this._presenterTransformStream(presenter),
      this._csvTransformStream(),
      this._writeToFileStream(filenameWithPath, append)
    )
  }

  /**
   * Write the file header, passing the supplied data to the supplied presenter. Overwrites the content of the file if
   * it exists.
   */
  static async _writeHeader (data, presenter, filenameWithPath) {
    await this._writeSection(Readable.from([data]), presenter, filenameWithPath)
  }

  /**
   * Write the file body, using the supplied query to read records from the database and passing them to the supplied
   * presenter. Appends the data to the existing file.
   */
  static async _writeBody (query, presenter, filenameWithPath) {
    await this._writeSection(this._recordStream(query), presenter, filenameWithPath, true)
  }

  /**
   * Write the file footer, passing the supplied data to the supplied presenter. Appends the data to the existing file.
   */
  static async _writeFooter (data, presenter, filenameWithPath) {
    await this._writeSection(Readable.from([data]), presenter, filenameWithPath, true)
  }

  /**
   * Wrap stream.pipeline in a promise so we can easily 'await' it.
   */
  static _promisifiedPipeline () {
    return util.promisify(pipeline)
  }

  /**
   * Readble stream which returns the results of the passed-in Objection QueryBuilder object.
   */
  static _recordStream (query) {
    return StreamRecordsService.go(query)
  }

  /**
   * Transform stream which processes an object supplied to it; this could be a row streamed from the database or an
   * object from elsewhere. It uses the passed-in Presenter to transform the data, then creates an array from the
   * resulting values, ensuring the values are first sorted in alphabetical order of key, on the basis that the
   * presenter will have its items named 'col01', 'col02' etc.
   *
   * While we should in theory receive the data from the presenter in the correct order, we sort it to ensure this is
   * the case as the order we store the data in the array is critical to producing the resulting file correctly.
   */
  static _presenterTransformStream (Presenter) {
    return new Transform({
      objectMode: true,
      transform: function (record, _encoding, callback) {
        const presenter = new Presenter(record)
        const dataObject = presenter.go()

        // Object.keys() gives us an array of keys in the object. We then sort it, and use map to create a new array by
        // iterating over the keys in their sorted order and retrieving the value of each one from dataObject.
        const sortedArray = Object
          .keys(dataObject)
          .sort()
          .map(key => dataObject[key])

        callback(null, sortedArray)
      }
    })
  }

  /**
   * Transform stream which joins an array with commas and adds a newline. Note that the fields aren't sanitised in any
   * way as the transaction files don't contain data that would need it (ie. containing commas etc.)
   */
  static _csvTransformStream () {
    return new Transform({
      objectMode: true,
      transform: function (array, _encoding, callback) {
        const csv = array.join()
        callback(null, csv.concat('\n'))
      }
    })
  }

  /**
   * Writeable stream that writes to a given file. Defaults to overwriting the content of the existing file; pass 'true'
   * as the second parameter to append the data instead.
   */
  static _writeToFileStream (filenameWithPath, append = false) {
    return fs.createWriteStream(filenameWithPath, append ? { flags: 'a' } : {})
  }
}

module.exports = TransformRecordsToFileService
