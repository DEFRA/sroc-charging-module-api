'use strict'

/**
 * @module BaseGenerateTransactionFileService
 */
const { TransactionModel } = require('../../../models')

const TransformRecordsToFileService = require('../transform_records_to_file.service')

class BaseGenerateTransactionFileService {
  /**
   * Generates and writes a transaction file for a bill run to a given filename in the temp folder.
   *
   * @param {module:BillRunModel} billRun The bill run to generate the transaction file for.
   * @param {string} filename The name of the file to be generated.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (billRun, filename) {
    return TransformRecordsToFileService.go(
      this._query(billRun),
      this._headPresenter(),
      this._bodyPresenter(),
      this._tailPresenter(),
      filename,
      this._additionalData(billRun)
    )
  }

  static _query (billRun) {
    // Note that we use .knexQuery() as Objection's standard .query() does not support streaming
    return TransactionModel
      .knexQuery()
      .join(...this._join())
      .select(...this._select())
      .orderBy(...this._sort())
      .where(builder => this._where(builder, billRun))
  }

  /**
   * Presenter that handles the head line of the transaction file.
   *
   * **Must be overridden by extending class**
   */
  static _headPresenter () {
    throw new Error("Extending class must implement '_headPresenter()'")
  }

  /**
   * Presenter that handles the body of the transaction file.
   *
   * **Must be overridden by extending class**
   */
  static _bodyPresenter () {
    throw new Error("Extending class must implement '_bodyPresenter()'")
  }

  /**
   * Presenter that handles the tail line of the transaction file.
   *
   * **Must be overridden by extending class**
   */
  static _tailPresenter () {
    throw new Error("Extending class must implement '_tailPresenter()'")
  }

  /**
   * Object containing additional data required by the header and tail, which will be passed to each presenter when the
   * db data is streamed to them.
   *
   * **Must be overridden by extending class**
   */
  static _additionalData () {
    throw new Error("Extending class must implement '_additionalData()'")
  }

  /**
   * Array of tables to be joined
   *
   * **Must be overridden by extending class**
   */
  static _join () {
    throw new Error("Extending class must implement '_join()'")
  }

  /**
   * Array of columns to be selected
   *
   * **Must be overridden by extending class**
   */
  static _select () {
    throw new Error("Extending class must implement '_select()'")
  }

  /**
   * Array of columns to be sorted by, in the order to sort them
   *
   * **Must be overridden by extending class**
   */
  static _sort () {
    throw new Error("Extending class must implement '_sort()'")
  }

  /**
   * Function which receives a QueryBuilder object and a bill run, and returns a QueryBuilder which specifies the
   * selection criteria, eg:
   *
   * return builder
   *   .where('transactions.billRunId', billRun.id)
   *   .whereNotNull('invoices.transactionReference')
   *   .whereNot('chargeValue', 0)
   *
   * **Must be overridden by extending class**
   */
  static _where () {
    throw new Error("Extending class must implement '_where()'")
  }
}

module.exports = BaseGenerateTransactionFileService
