'use strict'

/**
 * @module CreateTransactionTallyService
 */

const { raw } = require('../models/base.model')

class CreateTransactionTallyService {
  static go (transaction, tableName) {
    return this._generateTallyObject(transaction, tableName)
  }

  static _generateTallyObject (transaction, tableName) {
    const tallyObject = {
      insertData: {},
      updateStatements: [],
      patch: {}
    }

    const applyArguments = [
      tableName,
      transaction.chargeValue,
      transaction.subjectToMinimumCharge
    ]

    if (transaction.chargeCredit) {
      this._applyCreditToUpsertObject(tallyObject, ...applyArguments)
    } else if (transaction.chargeValue === 0) {
      this._applyZeroToUpsertObject(tallyObject, ...applyArguments)
    } else {
      this._applyDebitToUpsertObject(tallyObject, ...applyArguments)
    }

    return tallyObject
  }

  static _applyCreditToUpsertObject (tallyObject, tableName, chargeValue, subjectToMinimumCharge) {
    tallyObject.insertData.creditLineCount = 1
    tallyObject.patch.creditLineCount = raw('credit_line_count + ?', 1)
    tallyObject.updateStatements.push(
      `credit_line_count = ${tableName}.credit_line_count + EXCLUDED.credit_line_count`
    )

    tallyObject.insertData.creditLineValue = chargeValue
    tallyObject.patch.creditLineValue = raw('credit_line_value + ?', chargeValue)
    tallyObject.updateStatements.push(
      `credit_line_value = ${tableName}.credit_line_value + EXCLUDED.credit_line_value`
    )

    if (subjectToMinimumCharge) {
      tallyObject.insertData.subjectToMinimumChargeCount = 1
      tallyObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
      tallyObject.updateStatements.push(
        `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
      )

      tallyObject.insertData.subjectToMinimumChargeCreditValue = chargeValue
      tallyObject.patch.subjectToMinimumChargeCreditValue = raw(
        'subject_to_minimum_charge_credit_value + ?',
        chargeValue
      )
      tallyObject.updateStatements.push(
        `subject_to_minimum_charge_credit_value = ${tableName}.subject_to_minimum_charge_credit_value + EXCLUDED.subject_to_minimum_charge_credit_value`
      )
    }
  }

  static _applyDebitToUpsertObject (tallyObject, tableName, chargeValue, subjectToMinimumCharge) {
    tallyObject.insertData.debitLineCount = 1
    tallyObject.patch.debitLineCount = raw('debit_line_count + ?', 1)
    tallyObject.updateStatements.push(
      `debit_line_count = ${tableName}.debit_line_count + EXCLUDED.debit_line_count`
    )

    tallyObject.insertData.debitLineValue = chargeValue
    tallyObject.patch.debitLineValue = raw('debit_Line_value + ?', chargeValue)
    tallyObject.updateStatements.push(
      `debit_Line_value = ${tableName}.debit_Line_value + EXCLUDED.debit_Line_value`
    )

    if (subjectToMinimumCharge) {
      tallyObject.insertData.subjectToMinimumChargeCount = 1
      tallyObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
      tallyObject.updateStatements.push(
        `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
      )

      tallyObject.insertData.subjectToMinimumChargeDebitValue = chargeValue
      tallyObject.patch.subjectToMinimumChargeDebitValue = raw(
        'subject_to_minimum_charge_debit_value + ?',
        chargeValue
      )
      tallyObject.updateStatements.push(
        `subject_to_minimum_charge_debit_value = ${tableName}.subject_to_minimum_charge_debit_value + EXCLUDED.subject_to_minimum_charge_debit_value`
      )
    }
  }

  static _applyZeroToUpsertObject (tallyObject, tableName, chargeValue, subjectToMinimumCharge) {
    tallyObject.insertData.zeroLineCount = 1
    tallyObject.patch.zeroLineCount = raw('zero_line_count + ?', 1)
    tallyObject.updateStatements.push(
      `zero_line_count = ${tableName}.zero_line_count + EXCLUDED.zero_line_count`
    )

    if (subjectToMinimumCharge) {
      tallyObject.insertData.subjectToMinimumChargeCount = 1
      tallyObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
      tallyObject.updateStatements.push(
        `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
      )
    }
  }
}

module.exports = CreateTransactionTallyService
