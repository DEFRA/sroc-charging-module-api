'use strict'

const BasePresenter = require('./base.presenter')

class ChargePresenter extends BasePresenter {
  _presentation (data) {
    return {
      chargeValue: data.chargeValue,
      baselineCharge: data.baselineCharge,
      chargeElementAgreement: data.lineAttr10,
      licenceHolderAgreement: data.lineAttr9,
      prorataDays: data.lineAttr3,
      chargeFinancialYear: data.chargeFinancialYear
    }
  }
}

module.exports = ChargePresenter
