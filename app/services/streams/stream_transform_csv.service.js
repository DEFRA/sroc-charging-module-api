'use strict'

/**
 * @module StreamTransformCSVService
 */

const { Transform } = require('stream')

/**
 * Returns a Transform stream which turns an incoming array into a CSV row, ie. comma-separated, with each element
 * wrapped in double quotes, and ending with a newline.
 *
 * @returns {TransformStream} A stream of data.
 */
class StreamTransformCSVService {
  static go () {
    return new Transform({
      objectMode: true,
      transform: function (array, _encoding, callback) {
        const wrapped = array.map(element => {
          // JSON objects give us `[object Object]` when we use them in a template literal. We want to stringify these
          // objects to prevent this, but we ONLY want to stringify these types of objects
          if (`${element}` === '[object Object]') {
            element = JSON.stringify(element)
          }
          // If element is a string then convert all quotes " to two quotes "" as required by CSV format
          if (typeof element === 'string') {
            element = element.replace(/"/g, '""')
          }
          // Finally, return element wrapped in quotes
          return `"${element}"`
        })
        const csv = wrapped.join()

        callback(null, csv.concat('\n'))
      }
    })
  }
}

module.exports = StreamTransformCSVService
