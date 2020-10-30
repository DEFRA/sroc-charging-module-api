'use strict'

const BasePresenter = require('./base.presenter')

class RulesServicePresenter extends BasePresenter {
  _presentation (data) {
    return {
      regime: data.regime,
      financialYear: data.chargeFinancialYear,
      chargeParams: {
        WRLSChargingRequest: {
          chargeCategory: data.chargeCategoryCode,
          abatementAdjustment: data.regimeValue11,
          s127Agreement: data.regimeValue12,
          s130Agreement: data.regimeValue9,
          source: data.regimeValue6,
          billableDays: data.regimeValue4,
          abstractableDays: data.regimeValue5,
          compensationCharge: data.regimeValue17,
          secondPartCharge: data.regimeValue16
        }
      }
    }
  }
}

module.exports = RulesServicePresenter
