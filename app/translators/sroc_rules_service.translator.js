'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class SrocRulesServiceTranslator extends BaseTranslator {
  constructor (data) {
    // The rules service returns the data we need in a WRLSChargingResponse object within the response object
    super(data.WRLSChargingResponse)

    // baselineCharge and chargeValue are converted to pence
    this.baselineCharge = this._baselineCharge()
    this.chargeValue = this._chargeValue()

    // Charge element agreement is determined based on rules service response
    this.lineAttr10 = this._chargeElementAgreement()
  }

  _schema () {
    return Joi.object({
      chargeValue: Joi.number().required(),
      s127Agreement: Joi.string().allow(null),
      s130Agreement: Joi.string().allow(null),
      abatementAdjustment: Joi.string().required(),
      decisionPoints: Joi.object({
        baselineCharge: Joi.number().required()
      })
    }).options({ stripUnknown: true })
  }

  _translations () {
    return {
      s130Agreement: 'lineAttr9'
    }
  }

  _baselineCharge () {
    return this._convertToPence(this._data.decisionPoints.baselineCharge)
  }

  _chargeValue () {
    return this._convertToPence(this._data.chargeValue)
  }

  _convertToPence (value) {
    const floatValue = parseFloat(value)

    if (isNaN(floatValue)) {
      return null
    }

    return Math.round(floatValue * 100)
  }

  // The data used for the charge element agreement depends on what the rules service returns
  _chargeElementAgreement () {
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

module.exports = SrocRulesServiceTranslator
