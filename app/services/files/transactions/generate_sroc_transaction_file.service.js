'use strict'

/**
 * @module GenerateSrocTransactionFileService
 */

const BaseGenerateTransactionFileService = require('./base_generate_transaction_file.service')

const {
  TransactionFilePresrocBodyPresenter,
  TransactionFileHeadPresenter,
  TransactionFileTailPresenter
} = require('../../../presenters')

class GenerateSrocTransactionFileService extends BaseGenerateTransactionFileService {
  static _headPresenter () {
    return TransactionFileHeadPresenter
  }

  static _bodyPresenter () {
    return TransactionFilePresrocBodyPresenter
  }

  static _tailPresenter () {
    return TransactionFileTailPresenter
  }

  static _join () {
    return ['invoices', 'transactions.invoiceId', 'invoices.id']
  }

  static _select () {
    return [
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
    ]
  }

  static _sort () {
    return [
      'invoices.transactionReference', // sort by transaction reference
      'lineAttr1', // then sort by licence number
      'regimeValue17' // then sort by compensation charge, where non-compensation charge (ie. false) is first
    ]
  }

  static _where (builder, billRun) {
    return builder
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

module.exports = GenerateSrocTransactionFileService
