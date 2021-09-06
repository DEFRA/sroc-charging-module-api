'use strict'

/**
 * @module ConvertToCSVService
 */

class ConvertToCSVService {
  /**
   */
  static go (array) {
    const wrappedArray = array.map(element => {
      element = typeof element === 'object' ? this._handleObject(element) : element
      element = typeof element === 'string' ? this._handleString(element) : element
      return `"${element}"`
    })

    // Join all the elements of wrapped with commas between them, append a newline, and return the resulting CSV line
    return wrappedArray
      .join()
      .concat('\n')
  }

  // Handles objects by stringifying it, then removing any start and end quotes that have been added while doing it.
  static _handleObject (object) {
    const stringified = JSON.stringify(object)
    return this._wrappedInQuotes(stringified) ? this._chopString(stringified) : stringified
  }

  // Handles strings by replacing " with "" as required by CSV
  static _handleString (string) {
    return string.replace(/"/g, '""')
  }

  // Returns true if the provided string starts and ends with quote marks
  static _wrappedInQuotes (string) {
    return string.charAt(0) === '"' && string.charAt(string.length - 1) === '"'
  }

  // Chops first and last characters from string and returns resulting substring
  static _chopString (string) {
    return string.substr(1, string.length - 2)
  }
}

module.exports = ConvertToCSVService
