'use strict'

/**
 * @module TransformRecordsToFileService
 */

const path = require('path')
const { pipeline } = require('stream')
const util = require('util')
const { temporaryFilePath } = require('../../config/server.config')

const StreamReadableDataService = require('./stream_readable_data.service')
const StreamReadableRecordsService = require('./stream_readable_records.service')
const StreamTransformCSVService = require('./stream_transform_csv.service')
const StreamTransformUsingPresenterService = require('./stream_transform_using_presenter.service')
const StreamWritableFileService = require('./stream_writable_file.service')

class TransformRecordsToFileService {
  /**
   * Generates and writes a transaction file to a file in the temp folder. The filename will be the bill run's file
   * reference with '.dat' appended, ie. 'nalai50001.dat'
   *
   * @param {string} fileReference The bill run's file reference.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (billRun, invoice, query, headerPresenter, bodyPresenter, footerPresenter, fileReference) {
    const filenameWithPath = this._filenameWithPath(fileReference)

    await this._writeHeader(billRun, headerPresenter, filenameWithPath)
    await this._writeBody(query, bodyPresenter, filenameWithPath, {
      fileReference: billRun.fileReference,
      billRunNumber: billRun.billRunNumber,
      transactionReference: invoice.transactionReference
    })
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
  static async _writeSection (inputStream, presenter, filenameWithPath, append, additionalData) {
    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      inputStream,
      this._presenterTransformStream(presenter, additionalData),
      this._csvTransformStream(),
      this._writeToFileStream(filenameWithPath, append)
    )
  }

  /**
   * Write the file header, passing the supplied data to the supplied presenter. Overwrites the content of the file if
   * it exists.
   */
  static async _writeHeader (data, presenter, filenameWithPath, additionalData = {}) {
    await this._writeSection(this._dataStream(data), presenter, filenameWithPath, false, { ...additionalData })
  }

  /**
   * Write the file body, using the supplied query to read records from the database and passing them to the supplied
   * presenter. Appends the data to the existing file.
   */
  static async _writeBody (query, presenter, filenameWithPath, additionalData = {}) {
    await this._writeSection(this._recordStream(query), presenter, filenameWithPath, true, { ...additionalData })
  }

  /**
   * Write the file footer, passing the supplied data to the supplied presenter. Appends the data to the existing file.
   */
  static async _writeFooter (data, presenter, filenameWithPath, additionalData = {}) {
    await this._writeSection(this._dataStream(data), presenter, filenameWithPath, true, { ...additionalData })
  }

  /**
   * Wrap stream.pipeline in a promise so we can easily 'await' it.
   */
  static _promisifiedPipeline () {
    return util.promisify(pipeline)
  }

  /**
   * Readable stream which simply outputs the data passed to it.
   */
  static _dataStream (data) {
    return StreamReadableDataService.go(data)
  }

  /**
   * Readble stream which outputs the records returned by the passed-in Objection QueryBuilder object.
   */
  static _recordStream (query) {
    return StreamReadableRecordsService.go(query)
  }

  /**
   * Transform stream which processes an object supplied to it using the supplied Presenter, and optionally combining
   * each chunk of data it receives with additionalData, which allows us to eg. use bill run-level data when handling
   * transaction records.
   */
  static _presenterTransformStream (Presenter, additionalData = {}) {
    return StreamTransformUsingPresenterService.go(Presenter, additionalData)
  }

  /**
   * Transform stream which returns a comma-separated row of data, terminating in a newline. (NOTE: not sanitised)
   */
  static _csvTransformStream () {
    return StreamTransformCSVService.go()
  }

  /**
   * Writable stream that writes to a given file.
   */
  static _writeToFileStream (filenameWithPath, append) {
    return StreamWritableFileService.go(filenameWithPath, append)
  }
}

module.exports = TransformRecordsToFileService
