/**
 * @module TransactionFileTailPresenter
 */

import BasePresenter from './base.presenter.js'

/**
 * Formats data for the tail of a transaction file.
 *
 * Note that data.index is added by StreamTransformUsingPresenter and is not part of the data originally read from the
 * source transaction record.
 *
 * With reference to the existing v1 charging module transaction file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/transaction_file_presenter.js
 */

export default class TransactionFileTailPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'T',
      col02: this._leftPadZeroes(data.index, 7),
      col03: this._numberOfLinesInFile(data.index),
      col04: data.invoiceValue,
      col05: this._signedCreditValue(data.creditNoteValue, true)
    }
  }

  /**
   * Returns the number of lines in the file, which we calculate as the current row index + 1 (since index starts at 0)
   */
  _numberOfLinesInFile (index) {
    return index + 1
  }
}
