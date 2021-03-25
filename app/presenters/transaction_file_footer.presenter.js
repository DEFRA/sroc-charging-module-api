'use strict'

/**
 * @module TransactionFileHeaderPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for saving to the header of a transaction file.
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
class TransactionFileHeaderPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'T',
      col02: 'seq',
      col03: 'data.sequenceNumber',
      col04: 'data.invoiceTotal',
      col05: 'data.creditTotal'
    }
  }
}

module.exports = TransactionFileHeaderPresenter
