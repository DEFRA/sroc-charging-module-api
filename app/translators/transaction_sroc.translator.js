'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class TransactionSrocTranslator extends BaseTranslator {
  _schema () {
    const rules = this._rules()

    return Joi.object({
      ruleset: rules.ruleset,

      billRunId: rules.billRunId,
      regimeId: rules.regimeId,
      authorisedSystemId: rules.authorisedSystemId,
      region: rules.region,
      customerReference: rules.customerReference,
      batchNumber: rules.batchNumber,
      licenceNumber: rules.licenceNumber,
      chargePeriod: rules.chargePeriod,
      chargeElementId: rules.chargeElementId,
      areaCode: rules.areaCode,
      lineDescription: rules.lineDescription,
      clientId: rules.clientId,
      chargeCategoryDescription: rules.chargeCategoryDescription
    })
  }

  _rules () {
    return {
      ruleset: Joi.string().valid('sroc').required(),

      billRunId: Joi.string().required(),
      regimeId: Joi.string().required(),
      authorisedSystemId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      customerReference: Joi.string().uppercase().max(12).required(),
      batchNumber: Joi.string().allow('', null),
      licenceNumber: Joi.string().max(150).required(),
      chargePeriod: Joi.string().max(150).required(),
      chargeElementId: Joi.string().allow('', null),
      areaCode: Joi.string().uppercase().valid(...this._validAreas()).required(),
      lineDescription: Joi.string().max(240).required(),
      clientId: Joi.string().allow('', null),
      chargeCategoryDescription: Joi.string().max(150).required()
    }
  }

  // TODO: Translations need to be sorted correctly to use db fields as required eg. `regimeValue5` etc. For now we simply translate to the same string as the input
  _translations () {
    return {
      ruleset: 'ruleset',

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

  _validRegions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }

  _validAreas () {
    return [
      'ARCA',
      'AREA',
      'ARNA',
      'CASC',
      'MIDLS',
      'MIDLT',
      'MIDUS',
      'MIDUT',
      'AACOR',
      'AADEV',
      'AANWX',
      'AASWX',
      'NWCEN',
      'NWNTH',
      'NWSTH',
      'HAAR',
      'KAEA',
      'SAAR',
      'AGY2N',
      'AGY2S',
      'AGY3',
      'AGY3N',
      'AGY3S',
      'AGY4N',
      'AGY4S',
      'N',
      'SE',
      'SE1',
      'SE2',
      'SW',
      'ABNRTH',
      'DALES',
      'NAREA',
      'RIDIN',
      'DEFAULT',
      'MULTI'
    ]
  }
}

module.exports = TransactionSrocTranslator
