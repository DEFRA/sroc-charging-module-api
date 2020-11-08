'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class RulesServiceTranslator extends BaseTranslator {
  constructor (data) {
    // The rules service returns the data we need in a WRLSChargingResponse object within the response object
    super(data.WRLSChargingResponse)

    // Getter for baselineCharge which we convert to pence
    Object.defineProperty(this, 'baselineCharge', {
      get () {
        return this._baselineCharge()
      },
      enumerable: true
    })

    // Getter for chargeValue which we convert to pence
    Object.defineProperty(this, 'chargeValue', {
      get () {
        return this._chargeValue()
      },
      enumerable: true
    })

    // Getter for charge element agreement which is determined based on rules service response
    Object.defineProperty(this, 'lineAttr10', {
      get () {
        return this._chargeElementAgreement()
      },
      enumerable: true
    })
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

module.exports = RulesServiceTranslator
