'use strict'

const BaseTranslator = require('./base.translator')

class RulesServiceTranslator extends BaseTranslator {
  constructor (data) {
    // The rules service returns the data we need in a WRLSChargingResponse object within the response object
    super(data.WRLSChargingResponse)

    // Getter for baselineCharge which the rules service returns in the WRLSChargingResponse.decisionPoints object
    Object.defineProperty(this, 'baselineCharge', {
      get () {
        return this._data.decisionPoints.baselineCharge
      },
      enumerable: true
    })

    // // Getter for charge element agreement
    Object.defineProperty(this, 'lineAttr10', {
      get () {
        return this._chargeElementAgreement()
      },
      enumerable: true
    })
  }

  _translations () {
    return {
      chargeValue: 'chargeValue',
      s130Agreement: 'lineAttr9'
    }
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
