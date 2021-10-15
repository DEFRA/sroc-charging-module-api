'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')
const StaticLookupLib = require('../lib/static_lookup.lib')

class BillRunTranslator extends BaseTranslator {
  _translations () {
    return {
      authorisedSystemId: 'createdBy',
      regimeId: 'regimeId',
      region: 'region',
      status: 'status',
      ruleset: 'ruleset'
    }
  }

  _schema () {
    return Joi.object({
      authorisedSystemId: Joi.string().required(),
      regimeId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...StaticLookupLib.regions).required(),
      status: Joi.string().default('initialised'),
      ruleset: Joi.string().valid(...StaticLookupLib.rulesets).default('sroc')
    })
  }
}

module.exports = BillRunTranslator
