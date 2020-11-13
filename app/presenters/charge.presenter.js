'use strict'

const BasePresenter = require('./base.presenter')

class ChargePresenter extends BasePresenter {
  _presentation (data) {
    return {
      chargeValue: this._calculateChargeValue(data),
      baselineCharge: data.baselineCharge,
      chargeElementAgreement: data.lineAttr10,
      licenceHolderAgreement: data.lineAttr9,
      prorataDays: data.lineAttr3,
      chargeFinancialYear: data.chargeFinancialYear
    }
  }

  // Returns a negative or positive value for chargeValue dependent on whether chargeCredit is true or false
  _calculateChargeValue (data) {
    return data.chargeCredit ? -data.chargeValue : data.chargeValue
  }
}

module.exports = ChargePresenter
