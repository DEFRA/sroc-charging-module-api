'use strict'

/**
 * @module CreateTransactionTallyService
 */

const { raw } = require('../models/base.model')

class CreateTransactionTallyService {
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
