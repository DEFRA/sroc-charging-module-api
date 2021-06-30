/**
 * @module StreamTransformCSVService
 */

import { Transform } from 'stream'

/**
 * Returns a Transform stream which turns an incoming array into a CSV row, ie. comma-separated, with each element
 * wrapped in double quotes, and ending with a newline.
 *
 * @returns {TransformStream} A stream of data.
 */
export default class StreamTransformCSVService {
  static go () {
    return new Transform({
      objectMode: true,
      transform: function (array, _encoding, callback) {
        const wrapped = array.map(element => `"${element}"`)
        const csv = wrapped.join()

        callback(null, csv.concat('\n'))
      }
    })
  }
}
