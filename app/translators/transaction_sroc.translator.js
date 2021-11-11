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
      region: Joi.string().uppercase().valid(...this._validRegions()).required(), // DOUBLE CHECK IF uppercase() IS NEEDED
      customerReference: Joi.string().uppercase().max(12).required(),
      batchNumber: Joi.string().allow('', null),
      licenceNumber: Joi.string().max(150).required(),
      chargePeriod: Joi.string().required(),
      chargeElementId: Joi.string().allow('', null),
      areaCode: Joi.string().uppercase().valid(...this._validAreas()).required(), // DOUBLE CHECK IF uppercase() IS NEEDED
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
      authorisedSystemId: 'authorisedSystemId',
      region: 'region',
      customerReference: 'customerReference',
      batchNumber: 'batchNumber',
      licenceNumber: 'licenceNumber',
      chargePeriod: 'chargePeriod',
      chargeElementId: 'chargeElementId',
      areaCode: 'areaCode',
      lineDescription: 'lineDescription',
      clientId: 'clientId',
      chargeCategoryDescription: 'chargeCategoryDescription',

      // Charge-related, validated in CalculateChargeSrocTranslator
      abatementFactor: 'abatementFactor',
      actualVolume: 'actualVolume',
      aggregateProportion: 'aggregateProportion',
      authorisedDays: 'authorisedDays',
      billableDays: 'billableDays',
      chargeCategoryCode: 'chargeCategoryCode',
      compensationCharge: 'compensationCharge',
      credit: 'credit',
      loss: 'loss',
      periodEnd: 'chargePeriodEnd',
      periodStart: 'chargePeriodStart',
      regime: 'regime',
      regionalChargingArea: 'regionalChargingArea',
      section127Agreement: 'section127Agreement',
      section130Agreement: 'section130Agreement',
      supportedSource: 'supportedSource',
      supportedSourceName: 'supportedSourceName',
      twoPartTariff: 'twoPartTariff',
      authorisedVolume: 'authorisedVolume',
      waterCompanyCharge: 'waterCompanyCharge',
      waterUndertaker: 'waterUndertaker',
      winterOnly: 'winterOnly'
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
