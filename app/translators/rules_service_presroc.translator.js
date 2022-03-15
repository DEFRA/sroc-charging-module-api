'use strict'

/**
 * @module RulesServicePresrocTranslator
 */

const Joi = require('joi')

const RulesServiceBaseTranslator = require('./rules_service_base.translator.js')

class RulesServicePresrocTranslator extends RulesServiceBaseTranslator {
  constructor (data) {
    // The rules service returns the data we need in a WRLSChargingResponse object within the response object
    super(data.WRLSChargingResponse)

    // We retain a copy of the actual response for audit purposes
    this.chargeCalculation = JSON.stringify(data)

    this.chargeValue = this._convertToPence(this._data.chargeValue)
    this.lineAttr4 = this._convertToPence(this._data.sucFactor)

    // Charge element agreement is determined based on rules service response
    this.lineAttr10 = this._determineChargeElementAgreement()
  }

  _rules () {
    return {
      ...this._baseRules(),
      sucFactor: Joi.number(),
      sourceFactor: Joi.number(),
      seasonFactor: Joi.number(),
      lossFactor: Joi.number(),
      abatementAdjustment: Joi.string().required(),
      eiucSourceFactor: Joi.number(),
      eiucFactor: Joi.number()
    }
  }

  _translations () {
    return {
      sourceFactor: 'lineAttr6',
      seasonFactor: 'lineAttr7',
      lossFactor: 'lineAttr8',
      s130Agreement: 'lineAttr9',
      eiucSourceFactor: 'lineAttr13',
      eiucFactor: 'lineAttr14'
    }
  }

  // The data used for the charge element agreement depends on what the rules service returns
  _determineChargeElementAgreement () {
    // If a value is returned indicating an adjustment under Section 127 then use it
    if (this._data.s127Agreement) {
      return this._data.s127Agreement
    }

    // If a value is returned indicating an adjustment under Section 126 then use it
    if (this._data.abatementAdjustment !== 'S126 x 1.0') {
      return this._data.abatementAdjustment
    }

    // Otherwise, return null
    return null
  }
}

module.exports = RulesServicePresrocTranslator
