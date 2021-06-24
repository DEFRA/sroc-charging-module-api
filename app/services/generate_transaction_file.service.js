/**
 * @module GenerateTransactionFileService
 */

const { TransactionModel } = require('../models')
const TransformRecordsToFileService = require('./transform_records_to_file.service')
const {
  TransactionFileBodyPresenter,
  TransactionFileHeadPresenter,
  TransactionFileTailPresenter
} = require('../presenters')

class GenerateTransactionFileService {
  /**
   * Generates and writes a transaction file for a bill run to a given filename in the temp folder.
   *
   * @param {module:BillRunModel} billRun The bill run to generate the transaction file for.
   * @param {string} filename The name of the file to be generated.
   * @returns {string} The path and filename of the generated file.
   */
  static async go (billRun, filename) {
    const query = this._query(billRun)

    const additionalData = this._additionalData(billRun)

    return TransformRecordsToFileService.go(
      query,
      TransactionFileHeadPresenter,
      TransactionFileBodyPresenter,
      TransactionFileTailPresenter,
      filename,
      additionalData
    )
  }

  static _query (billRun) {
    // Note that we use .knexQuery() as Objection's standard .query() does not support streaming
    return TransactionModel
      .knexQuery()
      .join('invoices', 'transactions.invoiceId', 'invoices.id')
      .select(
        'transactions.customerReference',
        'transactionDate',
        'chargeCredit',
        'headerAttr1',
        'chargeValue',
        'lineAreaCode',
        'lineDescription',
        'lineAttr1',
        'lineAttr2',
        'lineAttr3',
        'lineAttr4',
        'lineAttr5',
        'lineAttr6',
        'lineAttr7',
        'lineAttr8',
        'lineAttr9',
        'lineAttr10',
        'lineAttr13',
        'lineAttr14',
        'regimeValue17',
        'minimumChargeAdjustment',
        'invoices.transactionReference',
        'invoices.creditLineValue',
        'invoices.debitLineValue'
      )
      .orderBy('invoices.transactionReference') // sort by transaction reference col06
      .orderBy('lineAttr1') // then sort by licence number col26
      .orderBy('regimeValue17') // then sort by compensation charge, where non-compensation charge (ie. false) is first
      .where('transactions.billRunId', billRun.id)
      .whereNotNull('invoices.transactionReference')
      .whereNot('chargeValue', 0)
  }

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
}

module.exports = GenerateTransactionFileService
