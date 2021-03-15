'use strict'

/**
 * @module CreateTransactionTallyService
 */

const { raw } = require('../models/base.model')

class CreateTransactionTallyService {
  /**
   * Generate a 'tally' object based on a transaction. The tally object includes the data and statements needed for
   * either an Objection `query().patch()` call or a PostgreSQL `INSERT .. ON CONFLICT` query, otherwise known as an
   * {@link https://www.postgresql.org/docs/current/sql-insert.html|UPSERT}.
   *
   * > A 'tally' object is our own naming for the thing this service generates. So, don't bother Googling it!
   *
   * We use the term 'tally' because the fields it is either inserting, updating or patching are those that tally the
   * number of debits, credits, zero value, and subject to minimum charge transactions linked to a bill run, invoice,
   * or licence.
   *
   * The issue this service tries to resolve is avoiding duplicating the same logic in multiple places. Each time a
   * transaction is added we need to know which tally fields to update in the bill run, invoice and licence it will be
   * linked to.
   *
   * The other problem we face is depending on the situation we are either patching, or needing to generate both an
   * `INSERT` and `UPDATE` statement to be used in an `UPSERT` query. What we have chosen to do is
   *
   * - centralise the logic of which tally fields to update here
   * - once the determination is made, generate all necessary data for all query types and return them as the 'tally
   * object'
   *
   * The calling service can then determine how to apply what this service returns.
   *
   * ```
   * const tallyObject = {
   *  insertData: {},
   *  updateStatements: [],
   *  patch: {}
   * }
   * ```
   *
   * An `UPSERT` statement comes in 2 parts; `INSERT INTO` and `ON CONFLICT DO UPDATE`
   *
   * ```
   *  INSERT INTO invoices ([field names]) VALUES ([values to be inserted])
   *  ON CONFLICT ([constraint field names]) DO UPDATE
   *  SET [field name] = EXCLUDED.[field name]
   * ```
   *
   * > Note that the special `EXCLUDED` table is used to reference values originally proposed for insertion
   *
   * The `insertData` property is intended to be used as part of generating the 'insert' statement which makes up the
   * first part of the upsert query, for example, `InvoiceModel.knexQuery().insert(tallyObject.insertData).toQuery()`.
   *
   * The `updateStatements` property is an array of 'set' statements needed for the second part, for example,
   * `DO UPDATE SET ${tallyObject.updateStatements.join(', ')}`.
   *
   * In the case of bill runs, we are always updating so no upsert is needed. We can just use standard
   * {@link https://vincit.github.io/objection.js/|Objection} to run a patch, for example,
   * `BillRunModel.query().findById(billRunId).patch(tallyObject.patch)`.
   *
   * @param {module:TransactionTranslator} transaction translator representing the transaction to be tallied and used as
   * the basis for the 'tally' object
   * @param {string} tableName name of the table the upsert will be run against (only really applicable for the `UPSERT`
   * statements)
   *
   * @returns {Object} the 'tally' object with its populated `insertData`, `updateStatements`, and `patch` properties
   */
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
