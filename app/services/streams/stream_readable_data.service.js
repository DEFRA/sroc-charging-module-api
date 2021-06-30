/**
 * @module StreamReadableDataService
 */

import { Readable } from 'stream'

/**
 * Returns a Readable stream of the data passed to it in a single 'chunk'.
 *
 * Note that the data is passed to Readable in an array, as Readable requires an Iterable.
 *
 * @param {object} data Data object to be streamed back.
 * @returns {ReadableStream} A stream of data.
 */
export default class StreamReadableDataService {
  static go (data) {
    return Readable
      .from([data])
  }
}
