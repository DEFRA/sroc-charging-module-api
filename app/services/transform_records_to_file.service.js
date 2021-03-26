'use strict'

/**
 * @module TransformRecordsToFileService
 */

const path = require('path')
const { pipeline } = require('stream')
const util = require('util')
const { temporaryFilePath } = require('../../config/server.config')

const StreamReadableDataService = require('./streams/stream_readable_data.service')
const StreamReadableRecordsService = require('./streams/stream_readable_records.service')
const StreamTransformCSVService = require('./streams/stream_transform_csv.service')
const StreamTransformUsingPresenterService = require('./streams/stream_transform_using_presenter.service')
const StreamWritableFileService = require('./streams/stream_writable_file.service')

class TransformRecordsToFileService {
  /**
   * Generates and writes a transaction file to a file in the temp folder. The filename will be the bill run's file
   * reference with '.dat' appended, ie. 'nalai50001.dat'
   *
   * @param {string} fileReference The bill run's file reference.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (billRun, query, headerPresenter, bodyPresenter, footerPresenter, fileReference, additionalData) {
    const filenameWithPath = this._filenameWithPath(fileReference)

    let recordCount

    recordCount = await this._writeHeader(billRun, headerPresenter, filenameWithPath, additionalData)
    // TODO: ENSURE THE BODY PRESENTER USES THE INDEX
    recordCount = await this._writeBody(query, bodyPresenter, filenameWithPath, additionalData, recordCount)
    // TODO: ENSURE THE FOOTER PRESENTER TAKES THE NUMBER OF RECORDS
    await this._writeFooter(billRun, footerPresenter, filenameWithPath, additionalData, recordCount)

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
   * @param {boolean} append Whether data should be appended to the file.
   * @param {object} additionalData Any additional data to be added to the presenter
   * @param {integer} [recordCount] The number of records written so far. We pass it in from previous sections so we can
   * keep a correct count of rows. Defaults to 0.
   * @returns {integer} The number of records written.
   */
  static async _writeSection (inputStream, presenter, filenameWithPath, append, additionalData, recordCount = 0) {
    // Add an event listener to inputStream to increment recordCount each time a record passes through the pipeline. We
    // add it to inputStream as only Readable streams emit the 'data' event.
    inputStream.on('data', () => recordCount++)

    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      inputStream,
      this._presenterTransformStream(presenter, additionalData, recordCount),
      this._csvTransformStream(),
      this._writeToFileStream(filenameWithPath, append)
    )

    return recordCount
  }

  /**
   * Write the file header, passing the supplied data to the supplied presenter. Overwrites the content of the file if
   * it exists.
   */
  static async _writeHeader (data, presenter, filenameWithPath, additionalData, recordCount) {
    return this._writeSection(this._dataStream(data), presenter, filenameWithPath, false, { ...additionalData }, recordCount)
  }

  /**
   * Write the file body, using the supplied query to read records from the database and passing them to the supplied
   * presenter. Appends the data to the existing file. Returns the number of records written.
   */
  static async _writeBody (query, presenter, filenameWithPath, additionalData, recordCount) {
    return this._writeSection(this._recordStream(query), presenter, filenameWithPath, true, { ...additionalData }, recordCount)
  }

  /**
   * Write the file footer, passing the supplied data to the supplied presenter. Appends the data to the existing file.
   */
  static async _writeFooter (data, presenter, filenameWithPath, additionalData, recordCount) {
    return this._writeSection(this._dataStream(data), presenter, filenameWithPath, true, { ...additionalData }, recordCount)
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
  static _presenterTransformStream (Presenter, additionalData, recordCount) {
    return StreamTransformUsingPresenterService.go(Presenter, additionalData, recordCount)
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
