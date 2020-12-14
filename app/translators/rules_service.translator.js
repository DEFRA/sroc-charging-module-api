'use strict'

/**
 * @module RulesServiceTranslator
 */

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class RulesServiceTranslator extends BaseTranslator {
  constructor (data) {
    // The rules service returns the data we need in a WRLSChargingResponse object within the response object
    super(data.WRLSChargingResponse)

    this.chargeValue = this._convertToPence(this._data.chargeValue)
    this.sucFactor = this._convertToPence(this._data.sucFactor)

    // Charge element agreement is determined based on rules service response
    this.lineAttr10 = this._determineChargeElementAgreement()
  }

  _schema () {
    return Joi.object({
      chargeValue: Joi.number().required(),
      sucFactor: Joi.number(),
      sourceFactor: Joi.number(),
      seasonFactor: Joi.number(),
      lossFactor: Joi.number(),
      abatementAdjustment: Joi.string().required(),
      s127Agreement: Joi.string().allow(null),
      s130Agreement: Joi.string().allow(null),
      eiucSourceFactor: Joi.number(),
      eiucFactor: Joi.number()
    }).options({ stripUnknown: true })
  }

  _translations () {
    return {
      chargeValue: 'chargeValue',
      sucFactor: 'lineAttr4',
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

  _convertToPence (value) {
    const floatValue = parseFloat(value)

    if (isNaN(floatValue)) {
      return null
    }

    return Math.round(floatValue * 100)
  }
}

module.exports = RulesServiceTranslator
