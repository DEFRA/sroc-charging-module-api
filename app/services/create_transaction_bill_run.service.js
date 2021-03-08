'use strict'

/**
 * @module CreateTransactionBillRunService
 */

const Boom = require('@hapi/boom')
const { raw } = require('../models/base.model')

class CreateTransactionBillRunService {
  static async go (billRun, transaction) {
    this._validateBillRun(billRun, transaction)

    return this._response(billRun.id, transaction)
  }

  static _validateBillRun (billRun, transaction) {
    if (billRun.region !== transaction.region) {
      throw Boom.badData(
        `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${transaction.region}.`
      )
    }
  }

  static async _response (id, transaction) {
    const patch = {
      id: id,
      update: this._generatePatch(transaction)
    }

    return patch
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

module.exports = CreateTransactionBillRunService
