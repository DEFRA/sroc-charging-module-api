'use strict'

/**
 * @module TransactionPresrocTranslator
 */

const TransactionBaseTranslator = require('./transaction_base.translator')
const Joi = require('joi')

class TransactionPresrocTranslator extends TransactionBaseTranslator {
  _rules () {
    return {
      ...this._baseRules(),
      ruleset: Joi.string().allow('presroc').default('presroc'),
      subjectToMinimumCharge: Joi.boolean().default(false)
    }
  }

  _translations () {
    return {
      billRunId: 'billRunId',
      regimeId: 'regimeId',
      authorisedSystemId: 'createdBy',
      ruleset: 'ruleset',
      region: 'region',
      customerReference: 'customerReference',
      periodStart: 'chargePeriodStart',
      periodEnd: 'chargePeriodEnd',
      subjectToMinimumCharge: 'subjectToMinimumCharge',
      clientId: 'clientId',
      credit: 'chargeCredit',
      areaCode: 'lineAreaCode',
      lineDescription: 'lineDescription',
      licenceNumber: 'lineAttr1',
      chargePeriod: 'lineAttr2',
      prorataDays: 'lineAttr3',
      volume: 'lineAttr5',
      batchNumber: 'regimeValue1',
      chargeElementId: 'regimeValue3',
      billableDays: 'regimeValue4',
      authorisedDays: 'regimeValue5',
      source: 'regimeValue6',
      season: 'regimeValue7',
      loss: 'regimeValue8',
      section130Agreement: 'regimeValue9',
      section126Agreement: 'regimeValue10',
      section126Factor: 'regimeValue11',
      section127Agreement: 'regimeValue12',
      eiucSource: 'regimeValue13',
      waterUndertaker: 'regimeValue14',
      regionalChargingArea: 'regimeValue15',
      twoPartTariff: 'regimeValue16',
      compensationCharge: 'regimeValue17'
    }
  }
}

module.exports = TransactionPresrocTranslator
