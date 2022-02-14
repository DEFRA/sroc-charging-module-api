'use strict'

/**
 * @module RulesServiceSrocPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the payload sent to the Rules Service when requesting a charge calculation.
 */
class RulesServiceSrocPresenter extends BasePresenter {
  _presentation (data) {
    return {
      ruleset: data.ruleset,
      regime: data.regime,
      financialYear: data.chargeFinancialYear,
      chargeParams: {
        WRLSChargingRequest: {
          // Some field names differ from their use elsewhere, eg. CalculateChargeSrocTranslator. Their alternate names
          // are commented below.
          abatementAdjustment: data.regimeValue11,
          abstractableDays: data.regimeValue5, // authorisedDays
          actualVolume: data.regimeValue20,
          aggregateProportion: data.headerAttr2,
          authorisedVolume: data.headerAttr3,
          billableDays: data.regimeValue4,
          chargeCategory: data.headerAttr4,
          compensationCharge: data.regimeValue17,
          loss: data.regimeValue8,
          regionalChargingArea: data.regimeValue15,
          s127Agreement: data.regimeValue12, // section127Agreement
          s130Agreement: data.regimeValue9, // section130Agreement
          secondPartCharge: data.regimeValue16, // twoPartTariff
          supportedSourceName: data.headerAttr6,
          supportedSourceChargeFlag: data.headerAttr5, // supportedSource
          waterCompanyChargeFlag: data.headerAttr7, // waterCompanyCharge
          waterUndertaker: data.regimeValue14,
          winterOnly: data.headerAttr8
        }
      }
    }
  }
}

module.exports = RulesServiceSrocPresenter
