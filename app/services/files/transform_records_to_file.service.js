'use strict'

/**
 * @module TransformRecordsToFileService
 */

const path = require('path')
const { pipeline } = require('stream')
const util = require('util')

const { temporaryFilePath } = require('../../../config/server.config.js')

const StreamReadableDataService = require('../streams/stream_readable_data.service.js')
const StreamReadableRecordsService = require('../streams/stream_readable_records.service.js')
const StreamTransformDatRowService = require('../streams/stream_transform_dat_row.service.js')
const StreamTransformUsingPresenterService = require('../streams/stream_transform_using_presenter.service.js')
const StreamWritableFileService = require('../streams/stream_writable_file.service.js')

class TransformRecordsToFileService {
  /**
   * Takes an Objection QueryBuilder object and passes its results through the provided presenters in order to generate
   * a file.
   *
   * The file comprises 3 parts:
   *
   * The bulk of the file is comprised of the body. Each line of the body is a database record selected by the passed-in
   * query. An additionalData object is passed in to the service and is made available to each line; allowing eg.
   * bill run-level data to be available to a query selecting transaction records.
   *
   * The head and the tail are a single line each, at the top and bottom of the file respectively. They take their data
   * from the additonalData object.
   *
   * @param {module:QueryBuilder} query The Objection query which will be run and the results passed to `bodyPresenter`
   * @param {module:Presenter} headPresenter The presenter used for the file head
   * @param {module:Presenter} bodyPresenter The presenter used for the file body
   * @param {module:Presenter} tailPresenter The presenter used for the file tail
   * @param {string} filename The filename to be saved to
   * @param {object} additionalData Additional data to be used for the head and tail, and to be passed
   * @returns {string} The full path and filename of the generated file
   */
  static async go (query, headPresenter, bodyPresenter, tailPresenter, filename, additionalData) {
    const filenameWithPath = this._filenameWithPath(filename)

    // We track the number of lines written as each line of the generated file includes a line number
    let lineCount

    lineCount = await this._writeHead(additionalData, headPresenter, filenameWithPath)
    lineCount = await this._writeBody(query, bodyPresenter, filenameWithPath, additionalData, lineCount)
    await this._writeTail(additionalData, tailPresenter, filenameWithPath, lineCount)

    return filenameWithPath
  }

  static _filenameWithPath (name) {
    // We use path.normalize to remove any double forward slashes that occur when assembling the path
    return path.normalize(
      path.format({
        dir: temporaryFilePath,
        name
      })
    )
  }

  /**
   * Transforms a stream of data and writes it to a file in dat format (ie. quotes around everything and
   * comma-separated). Intended to be used to write a "section" of a file, ie. head, body or tail.
   *
   * @param {ReadableStream} inputStream The stream of data to be written.
   * @param {module:Presenter} presenter The presenter to use to transform the data.
   * @param {string} filenameWithPath The filename and path to be written to.
   * @param {boolean} append Whether data should be appended to the file.
   * @param {object} additionalData Any additional data to be added to the presenter
   * @param {integer} [lineCount] The number of records written so far. We pass it in from previous sections so we can
   * keep a correct count of rows. Defaults to 0.
   * @returns {integer} The number of records written.
   */
  static async _writeSection (inputStream, presenter, filenameWithPath, append, additionalData, lineCount = 0) {
    // Add an event listener to inputStream to increment recordCount each time a record passes through the pipeline. We
    // add it to inputStream as only Readable streams emit the 'data' event.
    inputStream.on('data', () => lineCount++)

    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      inputStream,
      this._presenterTransformStream(presenter, additionalData, lineCount),
      this._datTransformStream(),
      this._writeToFileStream(filenameWithPath, append)
    )

    return lineCount
  }

  /**
   * Write the file head, passing the supplied data to the supplied presenter. Overwrites the content of the file if
   * it exists. Returns the number of records written.
   */
  static async _writeHead (data, presenter, filenameWithPath) {
    return this._writeSection(this._dataStream(data), presenter, filenameWithPath, false, null)
  }

  /**
   * Write the file body, using the supplied query to read records from the database and passing them to the supplied
   * presenter, along with additionalData. Appends the data if the file already exists, or creates it if not. Returns
   * the number of records written.
   */
  static async _writeBody (query, presenter, filenameWithPath, additionalData, lineCount) {
    return this._writeSection(this._recordStream(query), presenter, filenameWithPath, true, { ...additionalData }, lineCount)
  }

  /**
   * Write the file tail, passing the supplied data to the supplied presenter. Appends the data if the file already
   * exists, or creates it if not. Returns the number of records written.
   */
  static async _writeTail (data, presenter, filenameWithPath, lineCount) {
    return this._writeSection(this._dataStream(data), presenter, filenameWithPath, true, null, lineCount)
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
  static _presenterTransformStream (Presenter, additionalData, lineCount) {
    return StreamTransformUsingPresenterService.go(Presenter, additionalData, lineCount)
  }

  /**
   * Transform stream which returns a quoted and comma-separated row of data, terminating in a newline.
   */
  static _datTransformStream () {
    return StreamTransformDatRowService.go()
  }

  /**
   * Writable stream that writes to a given file.
   */
  static _writeToFileStream (filenameWithPath, append) {
    return StreamWritableFileService.go(filenameWithPath, append)
  }
}

module.exports = TransformRecordsToFileService
