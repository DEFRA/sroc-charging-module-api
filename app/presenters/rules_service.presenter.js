/**
 * @module RulesServicePresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the payload sent to the Rules Service when requesting a charge calculation.
 */
class RulesServicePresenter extends BasePresenter {
  _presentation (data) {
    return {
      ruleset: data.ruleset,
      regime: data.regime,
      financialYear: data.chargeFinancialYear,
      chargeParams: {
        WRLSChargingRequest: {
          billableDays: data.regimeValue4,
          abstractableDays: data.regimeValue5,
          volume: data.lineAttr5,
          source: data.regimeValue6,
          season: data.regimeValue7,
          loss: data.regimeValue8,
          secondPartCharge: data.regimeValue16,
          compensationCharge: data.regimeValue17,
          eiucSource: data.regimeValue13,
          waterUndertaker: data.regimeValue14,
          region: data.regimeValue15,
          s127Agreement: data.regimeValue12,
          s130Agreement: data.regimeValue9,
          abatementAdjustment: data.regimeValue11
        }
      }
    }
  }
}

module.exports = RulesServicePresenter
