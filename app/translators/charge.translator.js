const BaseTranslator = require('./base.translator')

class ChargeTranslator extends BaseTranslator {
  get _translations () {
    return {
      periodStart: 'charge_period_start',
      periodEnd: 'charge_period_end',
      credit: 'charge_credit',
      billableDays: 'regime_value_4',
      authorisedDays: 'regime_value_5',
      volume: 'line_attr_5',
      source: 'regime_value_6',
      season: 'regime_value_7',
      loss: 'regime_value_8',
      section130Agreement: 'regime_value_9',
      section126Agreement: 'regime_value_10',
      section126Factor: 'regime_value_11',
      section127Agreement: 'regime_value_12',
      eiucSource: 'regime_value_13',
      waterUndertaker: 'regime_value_14',
      regionalChargingArea: 'regime_value_15',
      twoPartTariff: 'regime_value_16',
      compensationCharge: 'regime_value_17'
    }
  }
}

module.exports = ChargeTranslator
