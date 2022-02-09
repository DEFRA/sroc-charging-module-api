'use strict'

/**
 * @module TransactionSrocTranslator
 */

const TransactionBaseTranslator = require('./transaction_base.translator')
const Joi = require('joi')

class TransactionSrocTranslator extends TransactionBaseTranslator {
  _rules () {
    return {
      ...this._baseRules(),
      ruleset: Joi.string().valid('sroc').required(),
      chargeCategoryDescription: Joi.string().max(150).required()
    }
  }

  _translations () {
    return {
      ruleset: 'ruleset',
      prorataDays: 'lineAttr3',

      // Transaction-related, validated here
      billRunId: 'billRunId',
      regimeId: 'regimeId',
      authorisedSystemId: 'createdBy',
      region: 'region',
      customerReference: 'customerReference',
      batchNumber: 'regimeValue1',
      licenceNumber: 'lineAttr1',
      chargePeriod: 'lineAttr2',
      chargeElementId: 'regimeValue3',
      areaCode: 'lineAreaCode',
      lineDescription: 'lineDescription',
      clientId: 'clientId',
      chargeCategoryDescription: 'regimeValue18',

      // Charge-related, validated in CalculateChargeSrocTranslator
      abatementFactor: 'regimeValue19',
      actualVolume: 'regimeValue20',
      aggregateProportion: 'headerAttr2',
      authorisedDays: 'regimeValue5',
      authorisedVolume: 'headerAttr3',
      billableDays: 'regimeValue4',
      chargeCategoryCode: 'headerAttr4',
      compensationCharge: 'regimeValue17',
      credit: 'chargeCredit',
      loss: 'regimeValue8',
      periodEnd: 'chargePeriodEnd',
      periodStart: 'chargePeriodStart',
      regime: 'regime',
      regionalChargingArea: 'regimeValue15',
      section127Agreement: 'regimeValue12',
      section130Agreement: 'regimeValue9',
      supportedSource: 'headerAttr5',
      supportedSourceName: 'headerAttr6',
      twoPartTariff: 'regimeValue16',
      waterCompanyCharge: 'headerAttr7',
      waterUndertaker: 'regimeValue14',
      winterOnly: 'headerAttr8'
    }
  }
}

module.exports = TransactionSrocTranslator
