'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class CustomerTranslator extends BaseTranslator {
  _schema () {
    return Joi.object({
      regimeId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      customerReference: Joi.string().uppercase().max(12).required(),
      customerName: Joi.string().required(),
      addressLine1: Joi.string().required(),
      addressLine2: Joi.string(),
      addressLine3: Joi.string(),
      addressLine4: Joi.string(),
      addressLine5: Joi.string(),
      addressLine6: Joi.string(),
      postcode: Joi.string()
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
