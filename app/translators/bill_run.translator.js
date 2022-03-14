'use strict'

const Joi = require('joi')

const BaseTranslator = require('./base.translator.js')

const StaticLookupLib = require('../lib/static_lookup.lib.js')

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
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      status: Joi.string().default('initialised'),
      ruleset: Joi.string().valid(...this._validRulesets()).default('sroc')
    })
  }

  _validRegions () {
    return StaticLookupLib.regions
  }

  _validRulesets () {
    return StaticLookupLib.rulesets
  }
}

module.exports = BillRunTranslator
