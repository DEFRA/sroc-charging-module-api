'use strict'

/**
 * @module CreateTransactionTallyService
 */

const { raw } = require('../../models/base.model')

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
    const tallyObject = {
      insertData: {},
      updateStatements: [],
      patch: {}
    }

    const prefix = this._determineTallyPrefix(transaction)

    // Add the count based statements, for example, debitLineCount
    this._applyStandardTallyStatements(tallyObject, tableName, prefix, 'Count', 1)
    // Add the value based statements, for example, debitLineValue
    this._applyStandardTallyStatements(tallyObject, tableName, prefix, 'Value', transaction.chargeValue)

    if (transaction.subjectToMinimumCharge) {
      // Add the statements to handle subjectToMinimumChargeCount
      this._applyMinimumChargeCountTallyStatements(tallyObject, tableName)
      // Add the value based statements, for example, subjectToMinimumChargeDebitValue
      this._applyMinimumChargeValueTallyStatements(tallyObject, tableName, prefix, transaction.chargeValue)
    }

    return tallyObject
  }

  /**
   * Determine what the prefix to use (`Debit`, `Credit` or `Zero`) in the statements
   *
   * Note - We title case the returned value so it can be used in both standard tally fields and subject to minimum
   * charge ones. In `_applyStandardTallyStatements()` it will be lowercased so we get `debitLineCount`. In
   * `_applyMinimumChargeValueTallyStatements() we need to generate `subjectToMinimumChargeCreditValue`. It's easier
   * to lowercase a string than title case it.
   */
  static _determineTallyPrefix (transaction) {
    let prefix = transaction.chargeCredit ? 'Credit' : 'Debit'

    if (transaction.chargeValue === 0) {
      prefix = 'Zero'
    }

    return prefix
  }

  static _applyStandardTallyStatements (tallyObject, tableName, prefix, suffix, value) {
    // Don't bother to generate an insert/update/patch if the value is 0. There is no point
    if (!value) {
      return
    }

    // For example debitLineCount
    const propertyName = `${prefix.toLowerCase()}Line${suffix}`
    tallyObject.insertData[propertyName] = value

    // For example debit_line_count
    const columnName = `${prefix}_line_${suffix}`.toLowerCase()
    tallyObject.patch[propertyName] = raw(`${columnName} + ?`, value)
    tallyObject.updateStatements.push(`${columnName} = ${tableName}.${columnName} + EXCLUDED.${columnName}`)
  }

  /**
   * Apply statements to insert/patch/update `subjectToMinimumChargeCount`
   *
   * If a transaction is subject to minimum charge, it doesn't matter if it's a debit, credit or zero value we need to
   * increment the `subjectToMinimumChargeCount` field. So, it has its own method and we felt its simpler and clearer
   * than trying to be dynamic in `_applyMinimumChargeValueTallyStatements()`.
   */
  static _applyMinimumChargeCountTallyStatements (tallyObject, tableName) {
    tallyObject.insertData.subjectToMinimumChargeCount = 1
    tallyObject.patch.subjectToMinimumChargeCount = raw('subject_to_minimum_charge_count + ?', 1)
    tallyObject.updateStatements.push(
      `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
    )
  }

  static _applyMinimumChargeValueTallyStatements (tallyObject, tableName, prefix, value) {
    // Don't bother to generate an insert/update/patch if the value is 0. There is no point
    if (!value) {
      return
    }

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
