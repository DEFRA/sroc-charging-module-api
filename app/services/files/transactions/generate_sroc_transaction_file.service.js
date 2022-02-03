'use strict'

/**
 * @module GenerateSrocTransactionFileService
 */

const BaseGenerateTransactionFileService = require('./base_generate_transaction_file.service')

const {
  TransactionFileHeadPresenter,
  TransactionFileSrocBodyPresenter,
  TransactionFileTailPresenter
} = require('../../../presenters')

class GenerateSrocTransactionFileService extends BaseGenerateTransactionFileService {
  static _headPresenter () {
    return TransactionFileHeadPresenter
  }

  static _bodyPresenter () {
    return TransactionFileSrocBodyPresenter
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
      'headerAttr4', // chargeCategoryCode
      'regimeValue18', // chargeCategoryDescription
      'headerAttr9', // baseCharge
      'regimeValue17', // compensationCharge
      'headerAttr2', // aggregateProportion
      'lineAttr12', // winterOnly
      'regimeValue9', // section130Agreement
      'regimeValue19', // abatementFactor
      'regimeValue12', // section127Agreement
      'headerAttr5', // supportedSource
      'lineAttr11', // supportedSourceValue
      'headerAttr6', // supportedSourceName
      'regimeValue16', // twoPartTariff
      'regimeValue20', // actualVolume
      'headerAttr3', // authorisedVolume
      'headerAttr7', // waterCompanyCharge
      'headerAttr10', // waterCompanyChargeValue
      'regimeValue2', // compensationChargePercent
      'regimeValue15', // regionalChargingArea

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
