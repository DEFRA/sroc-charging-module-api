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

  /**
   * Extracts the factor value from a string in the format `... x n.n`. For example, when given the string `S130U x
   * 0.5`, the number `0.5` is returned. Returns `null` if the string isn't in the expected format.
   */
  _extractFactor (string) {
    if (typeof string !== 'string') {
      return null
    }

    // Match the number using regex.
    // `.* x ` looks for any number of characters followed by ` x `
    // `(?<factor>\d\.\d*)` finds the first number like `0.5`, `0.833` etc. and assigns it to the match group `factor`
    const matches = string.match(/.* x (?<factor>\d\.\d*)/)

    if (!matches) {
      return null
    }

    return parseFloat(matches.groups.factor)
  }

  /**
   * If the provided string is for section 127 (ie. it begins `S127`) then return the factor as a number. Otherwise,
   * return `null`.
   */
  _extractS127Factor (string) {
    if (typeof string !== 'string') {
      return null
    }

    if (string.substring(0, 4) !== 'S127') {
      return null
    }

    return this._extractFactor(string)
  }
}

module.exports = BasePresenter
