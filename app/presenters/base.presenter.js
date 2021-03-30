'use strict'

class BasePresenter {
  constructor (data) {
    this._data = data
  }

  go () {
    return this._presentation(this._data)
  }

  _presentation () {
    throw new Error('You need to specify _presentation in the child presenter')
  }

  /**
   * Converts a date into the format required by output files, eg 25/03/2021 becomes 25-MAR-2021
   */
  _formatDate (date) {
    const dateObject = new Date(date)

    // We use .toLocaleString() to convert the date into a format close to the one we need, eg. "25 Mar 2021"
    // Passing 'en-GB' ensures it returns the elements in the correct order.
    const dateString = dateObject.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

    // Make the string upper case and replace the spaces with dashes
    return dateString
      .toUpperCase()
      .split(' ')
      .join('-')
  }

  /**
   * Pads a number to a given length with leading zeroes and returns the result as a string.
   */
  _leftPadZeroes (number, length) {
    return number
      .toString()
      .padStart(length, '0')
  }

  /**
   * If the value passed in is a credit then returns the value as a negative; otherwise returns it as a positive
   */
  _signedCreditValue (value, credit) {
    return credit ? -value : value
  }

  /**
   * null is an acceptable value to store in the db for some fields, however we would want to return an empty  field
   * instead of 'null'
   */
  _cleanseNull (value) {
    return value === null ? '' : value
  }
}

module.exports = BasePresenter
