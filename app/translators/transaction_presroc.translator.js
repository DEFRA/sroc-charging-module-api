'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class TransactionPresrocTranslator extends BaseTranslator {
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
      subjectToMinimumCharge: rules.subjectToMinimumCharge,
      clientId: rules.clientId
    })
  }

  _rules () {
    return {
      ruleset: Joi.string().allow('presroc').default('presroc'),

      billRunId: Joi.string().required(),
      regimeId: Joi.string().required(),
      authorisedSystemId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      customerReference: Joi.string().uppercase().max(12).required(),
      batchNumber: Joi.string().allow('', null),
      licenceNumber: Joi.string().max(150).required(),
      chargePeriod: Joi.string().required(),
      chargeElementId: Joi.string().allow('', null),
      areaCode: Joi.string().uppercase().valid(...this._validAreas()).required(),
      lineDescription: Joi.string().max(240).required(),
      subjectToMinimumCharge: Joi.boolean().default(false),
      clientId: Joi.string().allow('', null)
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

module.exports = TransactionPresrocTranslator
