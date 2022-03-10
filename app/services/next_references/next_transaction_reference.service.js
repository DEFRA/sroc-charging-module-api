'use strict'

/**
 * @module NextTransactionReferenceService
 */

const SequenceCounterModel = require('../../models/sequence_counter.model')

class NextTransactionReferenceService {
  /**
   * Returns the next transaction reference for the given region, regime and ruleset and whether it's for a credit note
   * or invoice
   *
   * The transaction number in the sequence_counters table is the last number issued. Therefore, we increment it by 1
   * and get the new number. We then take that value and format it as a **transaction reference**.
   *
   * If an invalid region & regime pair is supplied, an Objection `NotFoundError` is thrown. If an unvalid ruleset is
   * supplied a `TypeError` is thrown.
   *
   * @param {string} regimeId Id of the regime to get the next reference for
   * @param {string} region The region to get the next reference for
   * @param {string} ruleset The ruleset to get the next reference for
   * @param {string} transactionType Either a `'C'` or an `'I'` which denotes whether the invoice the reference is for
   * is an invoice or a credit note.
   * @param {Object} [trx] Optional Objection database `transaction` object to be used in the update to
   * `sequence_counters`
   *
   * @returns {string} the generated transaction reference
   */
  static async go (regimeId, region, ruleset, transactionType, trx = null) {
    const result = await this._updateSequenceCounter(regimeId, region, ruleset, trx)

    return this._response(region, ruleset, transactionType, result)
  }

  static async _updateSequenceCounter (regimeId, region, ruleset, trx) {
    const rulesetColumnNames = this._rulesetColumnNames()[ruleset]

    const result = await SequenceCounterModel.query(trx)
      .findOne({
        regime_id: regimeId,
        region
      })
      .increment(rulesetColumnNames.raw, 1)
      .returning(rulesetColumnNames.raw)
      .throwIfNotFound({
        message: 'Invalid combination of regime and region'
      })

    return result[rulesetColumnNames.camel]
  }

  static _rulesetColumnNames () {
    return {
      presroc: {
        raw: 'transaction_number_presroc', camel: 'transactionNumberPresroc'
      },
      sroc: {
        raw: 'transaction_number_sroc', camel: 'transactionNumberSroc'
      }
    }
  }

  static _response (region, ruleset, transactionType, transactionNumber) {
    if (ruleset === 'presroc') {
      return this._presrocResponse(region, transactionType, transactionNumber)
    }

    return this._srocResponse(region, transactionType, transactionNumber)
  }

  /**
   * Returns a presroc formatted transaction reference for the specificed region and transaction type
   *
   * * The format for presroc is `RAX1999999` where
   *
   * - `R` is the region indicator
   * - `A` is a fixed digit "A", ("Z" for draft type)
   * - `X` is the transaction type (C or I)
   * - `1` is a fixed digit "1"
   * - `999999` is our sequential transaction number padded to a 6-digit numeric string
   *
   * For example, if the region was 'R', the next transaction number was 3 and it was for a credit note the reference
   * would be `RAC1000003`.
   */
  static _presrocResponse (region, transactionType, transactionNumber) {
    return `${region}A${transactionType}1${this._padNumber(transactionNumber, 6)}`
  }

  /**
   * Returns an sroc formatted transaction reference for the specificed region and transaction type
   *
   * * The format for sroc is `RAX9999999T` where
   *
   * - `R` is the region indicator
   * - `A` is a fixed digit "A", ("Z" for draft type)
   * - `X` is the transaction type (C or I)
   * - `9999999` is our sequential transaction number padded to a 7-digit numeric string
   * - `T` is a fixed digit "T"
   *
   * For example, if the region was 'R', the next transaction number was 3 and it was for a credit note the reference
   * would be `RAC0000003T`.
   */
  static _srocResponse (region, transactionType, transactionNumber) {
    return `${region}A${transactionType}${this._padNumber(transactionNumber, 7)}T`
  }

  /**
   * Return a number as a string, padded with leading zeroes to meet the specified length
   *
   * For example, `_padNumber(3, 6)` will return `000003`.
   *
   * @param {Number} number the number to pad with zeroes
   * @param {Number} length the overall length required
   *
   * @returns {Number} the number padded with leading zeroes
   */
  static _padNumber (number, length) {
    return number.toString().padStart(length, '0')
  }
}

module.exports = NextTransactionReferenceService
