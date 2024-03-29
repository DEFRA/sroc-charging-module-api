'use strict'

/**
 * @module RulesServiceBaseTranslator
 */

const Joi = require('joi')

const BaseTranslator = require('./base.translator.js')

class RulesServiceBaseTranslator extends BaseTranslator {
  _schema () {
    const rules = this._rules()

    return Joi.object(rules).options({ stripUnknown: true })
  }

  _baseRules () {
    return {
      chargeValue: Joi.number().required(),
      s127Agreement: Joi.string().allow(null),
      s130Agreement: Joi.string().allow(null)
    }
  }

  _convertToPence (value) {
    const floatValue = parseFloat(value)

    return Math.round(floatValue * 100)
  }
}

module.exports = RulesServiceBaseTranslator
