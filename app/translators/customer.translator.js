'use strict'

const Joi = require('joi')

const BaseTranslator = require('./base.translator.js')

const StaticLookupLib = require('../lib/static_lookup.lib.js')

class CustomerTranslator extends BaseTranslator {
  _schema () {
    return Joi.object({
      regimeId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      customerReference: Joi.string().uppercase().max(12).required(),
      customerName: Joi.string().max(360).required(),
      addressLine1: Joi.string().max(240).required(),
      // We default these fields to `null` to ensure that any unspecified fields are overwritten with `null` when
      // updating an existing record:
      addressLine2: Joi.string().max(240).default(null),
      addressLine3: Joi.string().max(240).default(null),
      addressLine4: Joi.string().max(240).default(null),
      addressLine5: Joi.string().max(60).default(null),
      addressLine6: Joi.string().max(60).default(null),
      postcode: Joi.string().max(60).default('.')
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
    return StaticLookupLib.regions
  }
}

module.exports = CustomerTranslator
