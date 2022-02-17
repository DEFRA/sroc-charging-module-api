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

    // The output date format of methods such as toLocaleString() are based on the Unicode CLDR which is subject to
    // change and cannot be relied on to be consistent: https://github.com/nodejs/node/issues/42030. We therefore
    // generate the formatted date ourselves.
    const unpaddedDay = dateObject.getDate()
    const day = this._leftPadZeroes(unpaddedDay, 2)

    const monthStrings = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const month = monthStrings[dateObject.getMonth()]

    const year = dateObject.getFullYear()

    return `${day}-${month}-${year}`
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
   * If the value passed in is a credit it returns the value as a negative; otherwise returns it unchanged
   */
  _signedCreditValue (value, credit) {
    return credit ? -Math.abs(value) : value
  }

  /**
   * null is an acceptable value to store in the db for some fields, however we would want to return an empty field
   * instead of 'null'
   */
  _cleanseNull (value) {
    return value === null ? '' : value
  }

  _asBoolean (value) {
    if (value?.toLowerCase() === 'true') {
      return true
    }

    return false
  }
}

module.exports = BasePresenter
