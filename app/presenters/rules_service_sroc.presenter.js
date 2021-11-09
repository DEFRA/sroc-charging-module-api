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
          abatementAdjustment: data.abatementFactor,
          abstractableDays: data.authorisedDays,
          actualVolume: data.actualVolume,
          aggregateProportion: data.aggregateProportion,
          authorisedVolume: data.authorisedVolume,
          billableDays: data.billableDays,
          chargeCategory: data.chargeCategoryCode,
          compensationCharge: data.compensationCharge,
          loss: data.loss,
          regionalChargingArea: data.regionalChargingArea,
          s127Agreement: data.section127Agreement,
          s130Agreement: data.section130Agreement,
          secondPartCharge: data.twoPartTariff,
          supportedSourceName: data.supportedSourceName,
          supportedSourceChargeFlag: data.supportedSource,
          waterCompanyChargeFlag: data.waterCompany,
          waterUndertaker: data.waterUndertaker,
          winterOnly: data.winterOnly
        }
      }
    }
  }
}

module.exports = RulesServiceSrocPresenter
