'use strict'

/**
 * @module GeneratePresrocTransactionFileService
 */

const BaseGenerateTransactionFileService = require('./base_generate_transaction_file.service.js')

const TransactionFilePresrocBodyPresenter = require('../../../presenters/transaction_file_presroc_body.presenter.js')

class GeneratePresrocTransactionFileService extends BaseGenerateTransactionFileService {
  static _bodyPresenter () {
    return TransactionFilePresrocBodyPresenter
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
}

module.exports = GeneratePresrocTransactionFileService
