'use strict'

/**
 * @module GenerateSrocTransactionFileService
 */

const BaseGenerateTransactionFileService = require('./base_generate_transaction_file.service')

const TransactionFileSrocBodyPresenter = require('../../../presenters/transaction_file_sroc_body.presenter')

class GenerateSrocTransactionFileService extends BaseGenerateTransactionFileService {
  static _bodyPresenter () {
    return TransactionFileSrocBodyPresenter
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
      'headerAttr8', // winterOnly
      'regimeValue9', // section130Agreement
      'regimeValue11', // abatementFactor
      'regimeValue19', // adjustmentFactor
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
}

module.exports = GenerateSrocTransactionFileService
