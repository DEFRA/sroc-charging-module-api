'use strict'

/**
 * @module TransactionBaseTranslator
 */

const Joi = require('joi')

const BaseTranslator = require('./base.translator')

class TransactionBaseTranslator extends BaseTranslator {
  _schema () {
    const rules = this._rules()

    return Joi.object(rules)
  }

  _baseRules () {
    return {
      billRunId: Joi.string().required(),
      regimeId: Joi.string().required(),
      authorisedSystemId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      customerReference: Joi.string().uppercase().max(12).required(),
      batchNumber: Joi.string().allow('', null),
      licenceNumber: Joi.string().max(150).required(),
      chargeElementId: Joi.string().allow('', null),
      areaCode: Joi.string().uppercase().valid(...this._validAreas()).required(),
      lineDescription: Joi.string().max(240).required(),
      clientId: Joi.string().allow('', null),
      chargePeriod: Joi.string().max(150).required()
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

module.exports = TransactionBaseTranslator
