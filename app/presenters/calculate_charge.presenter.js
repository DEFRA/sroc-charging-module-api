/**
 * @module RulesServicePresenter
 */

import BasePresenter from './base.presenter.js'

/**
 * Handles formatting the data into the response we send to clients after a calculate charge request.
 */
export default class CalculateChargePresenter extends BasePresenter {
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
        suc: data.lineAttr4
      }
    }
  }

  // Returns a negative or positive value for chargeValue dependent on whether credit is true or false
  _calculateChargeValue (data) {
    return data.chargeCredit ? -data.chargeValue : data.chargeValue
  }
}
