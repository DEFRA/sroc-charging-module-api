/**
 * @module StreamTransformUsingPresenterService
 */

import { Transform } from 'stream'

/**
 * Returns a Transform stream which processes an object supplied to it using the supplied Presenter. It adds a field
 * `index` to the object which can be used by the Presenter to read the row number. It optionally accepts additional
 * data which will be added to the object before it is passed to the Presenter.
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
 * To ensure that rows in a file are numbered correctly, we optionally accept indexStart which is the number that the
 * index will start at. Say for example we have written the header and body of a file, with the rows numbered 1-19. When
 * this service is called to write the tail, an indexStart value of 20 will be passed in, ensuring that the tail row has
 * the correct number 20.
 *
 * @param {module:Presenter} Presenter Presenter to be used to transform data.
 * @param {object} [additionalData] Optional data object which will be combined with the incoming data before being
 * transformed.
 * @param {integer} [indexStart] The start value for the index. Used to ensure that we use the correct consecutive
 * numbering for each row of the data file. Defaults to 0.
 * @returns {TransformStream} A stream of data.
 */
export default class StreamTransformUsingPresenterService {
  static go (Presenter, additionalData = {}, indexStart = 0) {
    let index = indexStart

    return new Transform({
      objectMode: true,
      transform: function (currentRow, _encoding, callback) {
        const presenter = new Presenter({ ...currentRow, ...additionalData, index })
        const dataObject = presenter.go()

        // Object.keys() gives us an array of keys in the object. We then sort it, and use map to create a new array by
        // iterating over the keys in their sorted order and retrieving the value of each one from dataObject.
        const sortedArray = Object
          .keys(dataObject)
          .sort()
          .map(key => dataObject[key])

        index++

        callback(null, sortedArray)
      }
    })
  }
}
