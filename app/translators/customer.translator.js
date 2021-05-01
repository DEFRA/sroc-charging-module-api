'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class CustomerTranslator extends BaseTranslator {
  _schema () {
    return Joi.object({
      regimeId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      customerReference: Joi.string().uppercase().max(12).required(),
      customerName: Joi.string().max(360).required(),
      addressLine1: Joi.string().max(340).required(),
      addressLine2: Joi.string().max(240),
      addressLine3: Joi.string().max(240),
      addressLine4: Joi.string().max(240),
      addressLine5: Joi.string().max(60),
      addressLine6: Joi.string().max(60),
      postcode: Joi.string().max(60)
    })
  }

  _translations () {
    return {
      regimeId: 'regimeId',
      region: 'region',
      customerReference: 'customerReference',
      customerName: 'customerName',
      addressLine1: 'addressLine1',
      addressLine2: 'addressLine2',
      addressLine3: 'addressLine3',
      addressLine4: 'addressLine4',
      addressLine5: 'addressLine5',
      addressLine6: 'addressLine6',
      postcode: 'postcode'
    }
  }

  _validRegions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }
}

module.exports = CustomerTranslator
