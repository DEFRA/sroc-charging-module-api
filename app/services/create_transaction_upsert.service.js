'use strict'

/**
 * @module CreateTransactionUpsertService
 */

const { raw } = require('../models/base.model')
const { BillRunModel } = require('../models')

class CreateTransactionUpsertService {
  static async go (transaction, modelClass, trx = null) {
    const upsertObject = this._generateUpsertObject(transaction, modelClass)

    return this._apply(upsertObject, modelClass, trx)
  }

  static async _apply (upsertObject, modelClass, trx) {
    if (modelClass.name === 'BillRunModel') {
      await this._patch(upsertObject, trx)
      return upsertObject.source.billRunId
    } else {
      return this._upsert(upsertObject, modelClass, trx)
    }
  }

  static async _patch (upsertObject, trx) {
    await BillRunModel.query(trx).findById(upsertObject.source.billRunId).patch(upsertObject.patch)
  }

  static async _upsert (upsertObject, modelClass, trx) {
    const sql = this._generateSql(upsertObject, modelClass)
    const result = await modelClass.knex().raw(sql).transacting(trx)

    return result.rows[0].id
  }

  static _generateSql (upsertObject, modelClass) {
    return `${modelClass.knexQuery().insert(upsertObject.insertData).toQuery()}
      ON CONFLICT (${modelClass.transactionConstraintFields.join(', ')})
      DO UPDATE SET ${upsertObject.updateStatements.join(', ')}
      RETURNING id;`
  }

  static _generateUpsertObject (transaction, modelClass) {
    const upsertObject = {
      source: { ...transaction },
      insertData: this._initialInsertData(modelClass, transaction),
      updateStatements: [],
      patch: {}
    }

    const applyArguments = [
      modelClass.tableName,
      transaction.chargeValue,
      transaction.subjectToMinimumCharge
    ]

    if (transaction.chargeCredit) {
      this._applyCreditToUpsertObject(upsertObject, ...applyArguments)
    } else if (transaction.chargeValue === 0) {
      this._applyZeroToUpsertObject(upsertObject, ...applyArguments)
    } else {
      this._applyDebitToUpsertObject(upsertObject, ...applyArguments)
    }

    return upsertObject
  }

  static _initialInsertData (modelClass, transaction) {
    if (modelClass.name === 'BillRunModel') {
      return {}
    } else {
      return modelClass.createBaseOnInsertObject(transaction)
    }
  }

  static _applyCreditToUpsertObject (upsertObject, tableName, chargeValue, subjectToMinimumCharge) {
    upsertObject.insertData.creditLineCount = 1
    upsertObject.patch.creditLineCount = raw('credit_line_count + ?', 1)
    upsertObject.updateStatements.push(
      `credit_line_count = ${tableName}.credit_line_count + EXCLUDED.credit_line_count`
    )

    upsertObject.insertData.creditLineValue = chargeValue
    upsertObject.patch.creditLineValue = raw('credit_line_value + ?', chargeValue)
    upsertObject.updateStatements.push(
      `credit_line_value = ${tableName}.credit_line_value + EXCLUDED.credit_line_value`
    )

    if (subjectToMinimumCharge) {
      upsertObject.insertData.subjectToMinimumChargeCount = 1
      upsertObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
      upsertObject.updateStatements.push(
        `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
      )

      upsertObject.insertData.subjectToMinimumChargeCreditValue = chargeValue
      upsertObject.patch.subjectToMinimumChargeCreditValue = raw(
        'subject_to_minimum_charge_credit_value + ?',
        chargeValue
      )
      upsertObject.updateStatements.push(
        `subject_to_minimum_charge_credit_value = ${tableName}.subject_to_minimum_charge_credit_value + EXCLUDED.subject_to_minimum_charge_credit_value`
      )
    }
  }

  static _applyDebitToUpsertObject (upsertObject, tableName, chargeValue, subjectToMinimumCharge) {
    upsertObject.insertData.debitLineCount = 1
    upsertObject.patch.debitLineCount = raw('debit_line_count + ?', 1)
    upsertObject.updateStatements.push(
      `debit_line_count = ${tableName}.debit_line_count + EXCLUDED.debit_line_count`
    )

    upsertObject.insertData.debitLineValue = chargeValue
    upsertObject.patch.debitLineValue = raw('debit_Line_value + ?', chargeValue)
    upsertObject.updateStatements.push(
      `debit_Line_value = ${tableName}.debit_Line_value + EXCLUDED.debit_Line_value`
    )

    if (subjectToMinimumCharge) {
      upsertObject.insertData.subjectToMinimumChargeCount = 1
      upsertObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
      upsertObject.updateStatements.push(
        `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
      )

      upsertObject.insertData.subjectToMinimumChargeCreditValue = chargeValue
      upsertObject.patch.subjectToMinimumChargeCreditValue = raw(
        'subject_to_minimum_charge_debit_value + ?',
        chargeValue
      )
      upsertObject.updateStatements.push(
        `subject_to_minimum_charge_debit_value = ${tableName}.subject_to_minimum_charge_debit_value + EXCLUDED.subject_to_minimum_charge_debit_value`
      )
    }
  }

  static _applyZeroToUpsertObject (upsertObject, tableName, chargeValue, subjectToMinimumCharge) {
    upsertObject.insertData.zeroLineCount = 1
    upsertObject.patch.zeroLineCount = raw('zero_line_count + ?', 1)
    upsertObject.updateStatements.push(
      `zero_line_count = ${tableName}.zero_line_count + EXCLUDED.zero_line_count`
    )

    if (subjectToMinimumCharge) {
      upsertObject.insertData.subjectToMinimumChargeCount = 1
      upsertObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
      upsertObject.updateStatements.push(
        `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
      )
    }
  }
}

module.exports = CreateTransactionUpsertService
