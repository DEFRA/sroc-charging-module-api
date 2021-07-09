'use strict'

/**
 * @module TableBodyPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for the body of an exported table file.
 *
 * Takes a data object in the format:
 *  { first: 'A', second: 'B', third: 'C' }
 * and returns an object in the format:
 *  { col01: 'A', col02: 'B', col03: 'C' }
 */
class TableBodyPresenter extends BasePresenter {
  _presentation (data) {
    return this._columnNamedData(data)
  }

  _columnNamedData (data) {
    const returnData = {}
    let colNumber = 1

    // Iterate over the items in the data object and map eah one to an incrementingly-named key eg. col01, col02, col03
    for (const column in data) {
      const returnColumnName = this._formatKey(colNumber)
      returnData[returnColumnName] = data[column]
      colNumber += 1
    }

    return returnData
  }

  /**
   * Accepts a column number eg. 4 and returns a string in the format `col04` ie. zero-padded to 2 digits
   */
  _formatKey (col) {
    const paddedNumber = col.toString().padStart(2, '0')
    return `col${paddedNumber}`
  }
}

module.exports = TableBodyPresenter
