
'use strict'

/**
 * @module CalculateChargeSrocPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the response we send to clients after a calculate charge request.
 */
class CalculateChargeSrocPresenter extends BasePresenter {
  _presentation (data) {
    return {
      calculation: {
        chargeValue: this._calculateChargeValue(data),
        baseCharge: data.baseCharge,
        waterCompanyChargeValue: data.waterCompanyChargeValue,
        supportedSourceValue: data.supportedSourceValue,
        winterOnlyFactor: data.winterOnlyFactor,
        section130Factor: data.section130Factor,
        section127Factor: data.section127Factor,
        compensationChargePercent: data.compensationChargePercent
      }
    }
  }

  // Returns a negative or positive value for chargeValue dependent on whether credit is true or false
  _calculateChargeValue (data) {
    return data.chargeCredit ? -data.chargeValue : data.chargeValue
  }
}

module.exports = CalculateChargeSrocPresenter
