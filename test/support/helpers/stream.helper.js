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
  static async returnReadableStreamData (inputStream) {
    const result = []

    // Create a Writable stream that captures data coming into it and pushes it to the result array
    const outputStream = new Writable({
      objectMode: true,
      write (chunk, encoding, callback) {
        result.push(chunk)
        callback()
      }
    })

    // Create a promisifed pipline that runs asynchronously then use it to stream data from inputStream to outputStream
    const promisifiedPipeline = this._promisifiedPipeline()
    await promisifiedPipeline(
      inputStream,
      outputStream
    )

    return result
  }

  /**
   * Runs a Transform stream using the provided data and returns an array of its output.
   *
   * @param {TransformStream} transformStream The stream we want to capture the output of.
   * @param {object} data The data the stream will receive.
   * @returns {array} An array of the stream's output.
   */
  static async returnTransformStreamData (transformStream, data) {
    const result = []

    // Create a Readable stream that sends provided data
    const inputStream = Readable.from([data])

    // Create a Writable stream that captures data coming into it and pushes it to the result array
    const outputStream = new Writable({
      objectMode: true,
      write (chunk, encoding, callback) {
        result.push(chunk)
        callback()
      }
    })

    // Create a promisifed pipline that runs asynchronously then use it to stream data from inputStream to outputStream
    const promisifiedPipeline = this._promisifiedPipeline()
    await promisifiedPipeline(
      inputStream,
      transformStream,
      outputStream
    )

    return result
  }

  static _promisifiedPipeline () {
    return util.promisify(pipeline)
  }
}

module.exports = StreamHelper
