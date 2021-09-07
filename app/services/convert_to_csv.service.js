'use strict'

/**
 * @module ConvertToCSVService
 */

class ConvertToCSVService {
  /**
   * Converts an array into a CSV row, ie. each item contained in "", comma-separated, ending in a newline.
   *
   * @param {array} array The array to be converted.
   * @returns A string containing the converted CSV row.
   */
  static go (array) {
    const wrappedArray = array.map(element => {
      // If this is a "empty" element (ie. null, or blank string) then we can return early
      if (this._emptyElement(element)) {
        return ''
      }
      element = typeof element === 'object' ? this._handleObject(element) : element
      element = typeof element === 'string' ? this._handleString(element) : element
      return `${element}`
    })

    // Join all the elements with a comma between them, append a newline, and return the resulting CSV row
    return wrappedArray
      .join()
      .concat('\n')
  }

  // Returns true if this is an empty element
  static _emptyElement (element) {
    return element === null || element === ''
  }

  // Handles objects by stringifying them, then removing any start and end quotes that have been added while doing it.
  static _handleObject (object) {
    const stringified = JSON.stringify(object)
    // Some objects will be wrapped in quotes when stringified. We don't want this at this stage so we remove them.
    return this._wrappedInQuotes(stringified) ? this._chopString(stringified) : stringified
  }

  // Handles strings by replacing " with "" as required by CSV, then returning the result wrapped in quotes
  static _handleString (string) {
    const replaced = string.replace(/"/g, '""')
    return `"${replaced}"`
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
