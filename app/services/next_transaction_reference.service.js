'use strict'

/**
 * @module NextTransactionReferenceService
 */

const { SequenceCounterModel } = require('../models')

class NextTransactionReferenceService {
  /**
   * Returns the next transaction reference for the given region and regime and whether it's for a credit note or
   * invoice
   *
   * The transaction number in the sequence_counters table is the last number issued. Therefore, we increment it by 1
   * and get the new number. We then take that value and format it as a **transaction reference**.
   *
   * The format is `RAX1999999` where
   *
   * - `R` is the region indicator
   * - `A` is a fixed digit "A", ("Z" for draft type)
   * - `X` is the transaction type (C or I)
   * - `1` is a fixed digit "1"
   * - `999999` is our sequential transaction number padded to a 6-digit numeric string
   *
   * For example, if the region was 'R', the next transaction number was 3, and it was for a credit note the reference
   * would be `RAC1000003`.
   *
   * If an invalid region & regime pair is supplied, an Objection `NotFoundError` is thrown
   *
   * @param {string} regimeId Id of the regime to get the next reference for
   * @param {string} region The region to get the next reference for
   * @param {string} transactionType Either a `'C'` or an `'I'` which denotes whether the invoice the reference is for
   * is an invoice or a credit note.
   * @param {Object} [trx] Optional Objection database `transaction` object to be used in the update to
   * `sequence_counters`
   *
   * @returns {string} the generated transaction reference
   */
  static async go (regimeId, region, transactionType, trx = null) {
    const result = await this._updateSequenceCounter(regimeId, region, trx)

    return this._response(region, result.transactionNumber, transactionType)
  }

  static async _updateSequenceCounter (regimeId, region, trx) {
    return SequenceCounterModel.query(trx)
      .findOne({
        regime_id: regimeId,
        region
      })
      .increment('transaction_number', 1)
      .returning('transaction_number')
      .throwIfNotFound({
        message: 'Invalid combination of regime and region'
      })
  }

  static _response (region, transactionNumber, transactionType) {
    return `${region}A${transactionType}1${this._padNumber(transactionNumber)}`
  }

  /**
   * Return a number as a string, padded to 6 digits with leading zeroes
   *
   * For example, `_padNumber(3)` will return `000003`.
   *
   * @returns {Number} the number padded with leading zeroes
   */
  static _padNumber (number) {
    return number.toString().padStart(6, '0')
  }
}

module.exports = NextTransactionReferenceService
