'use strict'

/**
 * @module CreateTransactionTallyService
 */

const { raw } = require('../models/base.model')

class CreateTransactionTallyService {
  /**
   * Generate a 'patch' object based on a transaction for use in an Objection `query().patch()` call
   *
   * When a transaction is added to the system there are fields on the linked bill run, invoice and licence record that
   * need to be updated. These fields are essentially 'tallies' of the number and value of different types of
   * transactions added at that level.
   *
   * This service takes the transaction and returns an object which can be passed into a `patch()` call.
   *
   * ```
   *  await BillRunModel.query().findById(bullRunId).patch(patchObject)
   * ```
   *
   * @param {module:TransactionTranslator} transaction translator representing the transaction to be tallied and used as
   * the basis for the 'patch'
   *
   * @returns {Object} a 'patch' object suitable for using in an Objection `query().patch()` call where each property is
   * an instance of `RawBuilder`
   */
  static async go (transactionToBeTallied) {
    return this._generatePatch(transactionToBeTallied)
  }

  static _generatePatch (transaction) {
    const update = {}

    if (transaction.chargeCredit) {
      update.creditLineCount = raw('credit_line_count + ?', 1)
      update.creditLineValue = raw('credit_line_value + ?', transaction.chargeValue)
    } else if (transaction.chargeValue === 0) {
      update.zeroLineCount = raw('zero_line_count + ?', 1)
    } else {
      update.debitLineCount = raw('debit_line_count + ?', 1)
      update.debitLineValue = raw('debit_Line_value + ?', transaction.chargeValue)
    }

    if (transaction.subjectToMinimumCharge) {
      update.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)

      if (transaction.chargeCredit) {
        update.subjectToMinimumChargeCreditValue = raw(
          'subject_to_minimum_charge_credit_value + ?',
          transaction.chargeValue
        )
      } else if (transaction.chargeValue !== 0) {
        update.subjectToMinimumChargeDebitValue = raw(
          'subject_to_minimum_charge_debit_value + ?',
          transaction.chargeValue
        )
      }
    }

    return update
  }
}

module.exports = CreateTransactionTallyService
