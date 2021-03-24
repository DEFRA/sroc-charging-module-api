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
  static async go (query, headerPresenter, bodyPresenter, footerPresenter, fileReference) {
    const filenameWithPath = this._filenameWithPath(fileReference)

    await this._writeHeader(headerPresenter, filenameWithPath)
    await this._writeBody(query, bodyPresenter, filenameWithPath)
    await this._writeFooter(footerPresenter, filenameWithPath)

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

  static async _writeHeader (presenter, filenameWithPath) {
    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      Readable.from([['---HEADER---']]),
      this._csvTransformStream(),
      this._writeToFileStream(filenameWithPath)
    )
  }

  static async _writeBody (query, bodyPresenter, filenameWithPath) {
    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      this._recordStream(query),
      this._presenterTransformStream(bodyPresenter),
      this._csvTransformStream(),
      this._writeToFileStream(filenameWithPath, true)
    )
  }

  static async _writeFooter (presenter, filenameWithPath) {
    const promisifiedPipeline = this._promisifiedPipeline()

    await promisifiedPipeline(
      Readable.from([['---FOOTER---']]),
      this._csvTransformStream(),
      this._writeToFileStream(filenameWithPath, true)
    )
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
   * Transform stream which processes a database record. It uses the passed-in Presenter to transform the data, then
   * creates an array from the resulting values, ensuring the values are first sorted in alphabetical order of key, on
   * the basis that our presenter will have its items named 'col01', 'col02' etc.
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
   * Writeable stream that writes to a given file
   */
  static _writeToFileStream (filenameWithPath, append = false) {
    return fs.createWriteStream(filenameWithPath, append ? { flags: 'a' } : {})
  }
}

module.exports = TransformRecordsToFileService
