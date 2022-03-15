
'use strict'

/**
 * @module CalculateChargeSrocPresenter
 */

const BasePresenter = require('./base.presenter.js')

/**
 * Handles formatting the data into the response we send to clients after a calculate charge request.
 */
class CalculateChargeSrocPresenter extends BasePresenter {
  _presentation (data) {
    return {
      calculation: {
        chargeValue: this._calculateChargeValue(data),
        baseCharge: data.headerAttr9,
        waterCompanyChargeValue: data.headerAttr10,
        supportedSourceValue: data.lineAttr11,
        winterOnlyFactor: data.lineAttr12,
        section130Factor: data.lineAttr9,
        section127Factor: data.lineAttr15,
        compensationChargePercent: data.regimeValue2
      }
    }
  }

  // Returns a negative or positive value for chargeValue dependent on whether credit is true or false
  _calculateChargeValue (data) {
    return data.chargeCredit ? -data.chargeValue : data.chargeValue
  }
}

module.exports = CalculateChargeSrocPresenter
