'use strict'

/**
 * @module BaseGenerateTransactionFileService
 */

const TransactionModel = require('../../../models/transaction.model')

const TransactionFileHeadPresenter = require('../../../presenters/transaction_file_head.presenter')
const TransactionFileTailPresenter = require('../../../presenters/transaction_file_tail.presenter')

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
      // Note that we don't use the spread operator for orderBy as it expects an array, whereas we use it for join and
      // select as they expect multiple arguments ie. .select('first', 'second', 'third')
      .orderBy(this._sort())
      .where(builder => this._where(builder, billRun))
  }

  /**
   * Presenter that handles the head line of the transaction file.
   */
  static _headPresenter () {
    return TransactionFileHeadPresenter
  }

  /**
   * Presenter that handles the body of the transaction file.
   */
  static _bodyPresenter () {
    throw new Error("Extending class must implement '_bodyPresenter()'")
  }

  /**
   * Presenter that handles the tail line of the transaction file.
   */
  static _tailPresenter () {
    return TransactionFileTailPresenter
  }

  /**
   * Object containing additional data required by the header and tail, which will be passed to each presenter when the
   * db data is streamed to them.
   */
  static _additionalData (billRun) {
    return {
      region: billRun.region,
      billRunNumber: billRun.billRunNumber,
      billRunUpdatedAt: billRun.updatedAt,
      invoiceValue: billRun.invoiceValue,
      creditNoteValue: billRun.creditNoteValue,
      fileReference: billRun.fileReference
    }
  }

  /**
   * Array of tables to be joined
   */
  static _join () {
    return ['invoices', 'transactions.invoiceId', 'invoices.id']
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
   */
  static _sort () {
    return [
      'invoices.transactionReference', // sort by transaction reference
      'lineAttr1', // then sort by licence number
      'regimeValue17' // then sort by compensation charge, where non-compensation charge (ie. false) is first
    ]
  }

  /**
   * Function which receives a QueryBuilder object and a bill run, and returns a QueryBuilder which specifies the
   * selection criteria, eg:
   *
   * return builder
   *   .where('transactions.billRunId', billRun.id)
   *   .whereNotNull('invoices.transactionReference')
   *   .whereNot('chargeValue', 0)
   */
  static _where (builder, billRun) {
    return builder
      .where('transactions.billRunId', billRun.id)
      .whereNotNull('invoices.transactionReference')
      .whereNot('chargeValue', 0)
  }
}

module.exports = BaseGenerateTransactionFileService
