'use strict'

/**
 * @module RulesServicePresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the response we send to clients after a calculate charge request.
 */
class CalculateChargePresenter extends BasePresenter {
  _presentation (data) {
    return {
      calculation: {
        chargeValue: this._calculateChargeValue(data),
        sourceFactor: data.lineAttr6,
        seasonFactor: data.lineAttr7,
        lossFactor: data.lineAttr8,
        licenceHolderChargeAgreement: data.lineAttr9,
        chargeElementAgreement: data.lineAttr10,
        eiucSourceFactor: data.lineAttr13,
        eiuc: data.lineAttr14,
        suc: data.sucFactor
      }
    }
  }

  // Returns a negative or positive value for chargeValue dependent on whether credit is true or false
  _calculateChargeValue (data) {
    return data.credit ? -data.chargeValue : data.chargeValue
  }
}

module.exports = CalculateChargePresenter
