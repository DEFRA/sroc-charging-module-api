'use strict'

/**
 * @module TransactionFileTailPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for saving to the tail of a transaction file.
 *
 * With reference to the existing v1 charging module transaction file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/transaction_file_presenter.js
 */

/**
 * 'T',
 * seq,
 * this.sequenceNumber,
 * this.invoiceTotal,
 * this.creditTotal
 */
class TransactionFileTailPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'T',
      col02: this._leftPadZeroes(data.index, 7),
      col03: this._numberOfLinesInFile(data.index),
      col04: data.invoiceTotal,
      col05: data.creditTotal
    }
  }

  // The line index starts at 0, so the number of lines in the file is index + 1
  _numberOfLinesInFile (index) {
    return index + 1
  }
}

module.exports = TransactionFileTailPresenter
