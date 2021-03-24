'use strict'

/**
 * @module StreamTransformUsingPresenterService
 */

const { Transform } = require('stream')

/**
 * Returns a Transform stream which processes an object supplied to it using the supplied Presenter. Optionally accepts
 * additional data which will be added to the object before it is processed by the Presenter.
 *
 * The object supplied could be a row streamed from the database or an object from elsewhere. The Presenter is used to
 * transform the data, then an array is created from the resulting values, ensuring the values are first sorted in
 * alphabetical order of key, on the basis that the presenter will have its items named 'col01', 'col02' etc.
 *
 * While we should in theory receive the data from the presenter in the correct order, we sort it to ensure this is
 * the case as the order we store the data in the array is critical to producing the resulting file correctly.
 *
 * We are also able to pass an object containing additional data which will be added to each record before it's
 * passed to the presenter. For example, the bill run's file reference is required for each row of a transaction file
 * but this isn't present in the transaction records we pull from the db. We therefore pass it in when writing these
 * records so that it's available to us.
 *
 * @param {module:Presenter} Presenter Presenter to be used to transform data.
 * @param {object} [additionalData] Optional data object which will be combined with the incoming data before being
 * transformed.
 * @returns {TransformStream} A stream of data.
 */
class StreamTransformUsingPresenterService {
  static go (Presenter, additionalData = {}) {
    return new Transform({
      objectMode: true,
      transform: function (currentRow, _encoding, callback) {
        const presenter = new Presenter({ ...currentRow, ...additionalData })
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
}

module.exports = StreamTransformUsingPresenterService
