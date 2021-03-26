'use strict'

const { pipeline, Readable, Writable } = require('stream')
const util = require('util')

class StreamHelper {
  /**
   * Runs a Readable stream and returns an array of its output.
   *
   * @param {ReadableStream} inputStream The stream we want to capture the output of.
   * @returns {array} An array of the stream's output.
   */
  static async testReadableStream (inputStream) {
    const result = []

    await this._inputOutputPipeline(
      inputStream,
      this._captureDataInArray(result)
    )

    return result
  }

  /**
   * Runs a Transform stream using the provided data and returns an array of its output.
   *
   * @param {TransformStream} transformStream The stream we want to capture the output of.
   * @param {object} data The data the stream will receive.
   * @param {integer} [times] The optional number of times the data will be passed through the pipeline. Defaults to 1.
   * @returns {array} An array of the stream's output.
   */
  static async testTransformStream (transformStream, data, times = 1) {
    const dataArray = this._fillDataArray(data, times)

    const result = []

    await this._inputTransformOutputPipeline(
      this._sendDataFromArray(dataArray),
      transformStream,
      this._captureDataInArray(result))

    return result
  }

  /**
   * Runs a Writable stream using the provided data.
   *
   * @param {ReadableStream} inputStream The stream we want to capture the output of.
   * @param {object} data The data the stream will receive.
   * @param {integer} [times] The optional number of times the data will be passed through the pipeline. Defaults to 1.
   */
  static async testWritableStream (outputStream, data, times = 1) {
    const dataArray = this._fillDataArray(data, times)

    await this._inputOutputPipeline(
      this._sendDataFromArray(dataArray),
      outputStream
    )
  }

  /**
   * Returns an array of data, where `data` is repeated `times` times, eg. _fillDataArray('rhubarb', 3) returns:
   * ['rhubarb', 'rhubarb', 'rhubarb']
   */
  static _fillDataArray (data, times) {
    return new Array(times).fill(data)
  }

  /**
   * Returns a Writable stream that will capture data coming into it and push it to the provided array
   */
  static _captureDataInArray (result) {
    return new Writable({
      objectMode: true,
      write (chunk, encoding, callback) {
        result.push(chunk)
        callback()
      }
    })
  }

  /**
   * Returns a Writable stream that will send the array of data provided to it, one element at a time
   */
  static _sendDataFromArray (dataArray) {
    return Readable.from(dataArray)
  }

  /**
   * Runs an async pipeline passing data from inputStream > outputStream
   */
  static async _inputOutputPipeline (inputStream, outputStream) {
    await this._promisifiedPipeline()(inputStream, outputStream)
  }

  /**
   * Runs an async pipeline passing data from inputStream > transformStream > outputStream
   */
  static async _inputTransformOutputPipeline (inputStream, transformStream, outputStream) {
    await this._promisifiedPipeline()(inputStream, transformStream, outputStream)
  }

  /**
   * Returns pipeline wrapped in a promise, which allows us to simply `await` it to resolve
   */
  static _promisifiedPipeline () {
    return util.promisify(pipeline)
  }
}

module.exports = StreamHelper
