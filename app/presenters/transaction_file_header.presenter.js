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

class TransactionFileHeaderPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'H',
      col02: '0000000',
      col03: 'NAL',
      col04: data.region,
      col05: 'I',
      col06: data.fileId,
      col07: data.id,
      col08: this._formatDate(data.updatedAt)
    }
  }

  /**
   * Converts a date into the format required by the transaction file, eg 25/03/2021 becomes 25-MAR-2021
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
}

module.exports = TransactionFileHeaderPresenter
