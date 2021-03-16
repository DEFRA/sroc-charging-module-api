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

    if (transaction.chargeValue === 0) {
      this._applyZeroValueChanges(tallyObject, tableName, transaction)
    } else {
      this._applyStandardChanges(tallyObject, tableName, transaction)
    }

    return tallyObject
  }

  static _applyStandardChanges (tallyObject, tableName, transaction) {
    const prefix = transaction.chargeCredit ? 'Credit' : 'Debit'

    this._updateTallyObject(tallyObject, tableName, prefix, 'Count', 1)
    this._updateTallyObject(tallyObject, tableName, prefix, 'Value', transaction.chargeValue)

    if (transaction.subjectToMinimumCharge) {
      this._updateMinimumChargeCountTallyObject(tallyObject, tableName)
      this._updateMinimumChargeValueTallyObject(tallyObject, tableName, prefix, transaction.chargeValue)
    }
  }

  static _applyZeroValueChanges (tallyObject, tableName, transaction) {
    this._updateTallyObject(tallyObject, tableName, 'zero', 'Count', 1)

    if (transaction.subjectToMinimumCharge) {
      this._updateMinimumChargeCountTallyObject(tallyObject, tableName)
    }
  }

  static _updateTallyObject (tallyObject, tableName, prefix, suffix, value) {
    // For example debitLineCount
    const propertyName = `${prefix.toLowerCase()}Line${suffix}`

    tallyObject.insertData[propertyName] = value

    // For example debit_line_count
    const columnName = `${prefix}_line_${suffix}`.toLowerCase()

    tallyObject.patch[propertyName] = raw(`${columnName} + ?`, value)

    tallyObject.updateStatements.push(`${columnName} = ${tableName}.${columnName} + EXCLUDED.${columnName}`)
  }

  static _updateMinimumChargeCountTallyObject (tallyObject, tableName) {
    tallyObject.insertData.subjectToMinimumChargeCount = 1
    tallyObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
    tallyObject.updateStatements.push(
      `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
    )
  }

  static _updateMinimumChargeValueTallyObject (tallyObject, tableName, prefix, value) {
    // For example subjectToMinimumChargeCreditValue
    const propertyName = `subjectToMinimumCharge${prefix}Value`

    tallyObject.insertData[propertyName] = value

    // For example subject_to_minimum_charge_credit_value
    const columnName = `subject_to_minimum_charge_${prefix}_value`.toLowerCase()

    tallyObject.patch[propertyName] = raw(`${columnName} + ?`, value)

    tallyObject.updateStatements.push(`${columnName} = ${tableName}.${columnName} + EXCLUDED.${columnName}`)
  }
}

module.exports = CreateTransactionTallyService
