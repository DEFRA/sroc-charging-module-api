const BasePresenter = require('./base.presenter')

class ChargeToRulesServicePresenter extends BasePresenter {
  _presentations () {
    return {
      lineAttr5: 'volume',
      regimeValue4: 'billabledays',
      regimeValue5: 'abstractabledays',
      regimeValue6: 'source',
      regimeValue7: 'season',
      regimeValue8: 'loss',
      regimeValue9: 's130Agreement',
      regimeValue10: 's126Agreement',
      regimeValue11: 'abatementadjustment',
      regimeValue12: 's127Agreement',
      regimeValue13: 'eiucsource',
      regimeValue14: 'waterundertaker',
      regimeValue15: 'region',
      regimeValue16: 'secondpartcharge',
      regimeValue17: 'compensationcharge'
    }
  }
}

module.exports = ChargeToRulesServicePresenter
