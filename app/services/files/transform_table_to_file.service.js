'use strict'

/**
 * @module TransformTableToFileService
 */

const path = require('path')
const { pipeline } = require('stream')
const util = require('util')
const { temporaryFilePath } = require('../../../config/server.config')

const { TableFilePresenter } = require('../../presenters')

const StreamReadableDataService = require('../streams/stream_readable_data.service')
const StreamReadableRecordsService = require('../streams/stream_readable_records.service')
const StreamTransformCSVService = require('../streams/stream_transform_csv.service')
const StreamTransformUsingPresenterService = require('../streams/stream_transform_using_presenter.service')
const StreamWritableFileService = require('../streams/stream_writable_file.service')

class TransformTableToFileService {
  /**
   * Takes an Objection QueryBuilder object and passes its results through the provided presenters in order to generate
   * a file.
   *
   * The file comprises 2 parts:
   *
   * The head is a single line at the top. It takes its data from the columnNames array.
   *
   * The body comprises the rest of the file. Each line is a database record selected by the passed-in query.
   *
   * @param {module:QueryBuilder} query The Objection query which will be run and the results passed to `bodyPresenter`
   * @param {array} columnNames The names of the columns to be saved to in the head row.
   * @param {string} filename The filename to be saved to
   * @returns {string} The full path and filename of the generated file
   */
  static async go (query, columnNames, filename) {
    const filenameWithPath = this._filenameWithPath(filename)

    await this._writeHead(columnNames, TableFilePresenter, filenameWithPath)
    await this._writeBody(query, TableFilePresenter, filenameWithPath)

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
   * Transforms a stream of data and writes it to a file in CSV format. Intended to be used to write a "section" of a
   * file, ie. head, body or tail.
   *
   * @param {ReadableStream} inputStream The stream of data to be written.
   * @param {module:Presenter} presenter The presenter to use to transform the data.
   * @param {string} filenameWithPath The filename and path to be written to.
   * @param {boolean} append Whether data should be appended to the file.
   * @param {object} additionalData Any additional data to be added to the presenter
   * @returns {integer} The number of records written.
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
   * Write the file head, passing the supplied data to the supplied presenter. Overwrites the content of the file if
   * it exists.
   */
  static async _writeHead (data, presenter, filenameWithPath) {
    await this._writeSection(this._dataStream(data), presenter, filenameWithPath, false, null)
  }

  /**
   * Write the file body, using the supplied query to read records from the database and passing them to the supplied
   * presenter, along with additionalData. Appends the data if the file already exists, or creates it if not.
   */
  static async _writeBody (query, presenter, filenameWithPath, additionalData) {
    await this._writeSection(this._recordStream(query), presenter, filenameWithPath, true, { ...additionalData })
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
   * Transform stream which returns a comma-separated row of data, terminating in a newline.
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

module.exports = TransformTableToFileService
