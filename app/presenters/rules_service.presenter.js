const BasePresenter = require('./base.presenter')

class RulesServicePresenter extends BasePresenter {
  _presentation (data) {
    return {
      regime: data.regime,
      financialYear: data.financialYear,
      chargeParams: {
        volume: data.lineAttr5,
        billabledays: data.regimeValue4,
        abstractabledays: data.regimeValue5,
        source: data.regimeValue6,
        season: data.regimeValue7,
        loss: data.regimeValue8,
        s130Agreement: data.regimeValue9,
        s126Agreement: data.regimeValue10,
        chargeabatementadjustment: data.regimeValue11,
        s127Agreement: data.regimeValue12,
        eiucsource: data.regimeValue13,
        waterundertaker: data.regimeValue14,
        region: data.regimeValue15,
        secondpartcharge: data.regimeValue16,
        compensationcharge: data.regimeValue17
      }
    }
  }
}

module.exports = RulesServicePresenter
