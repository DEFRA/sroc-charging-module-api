'use strict'

/**
 * @module ViewTransactionPresenter
 */

const BasePresenter = require('./base.presenter.js')

/**
 * Handles formatting the transaction data into the response we send to clients when a GET request is received. Note
 * that we expect ruleset to be passed in on top of the regular transaction data.
 */
class ViewTransactionPresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      clientId: data.clientId,
      chargeValue: data.chargeValue,
      credit: data.chargeCredit,
      // We only include subjectToMinimumCharge if the ruleset is `presroc`
      ...(data.ruleset === 'presroc') && { subjectToMinimumCharge: data.subjectToMinimumCharge },
      // We only include minimumChargeAdjustment if the ruleset is `presroc`
      ...(data.ruleset === 'presroc') && { minimumChargeAdjustment: data.minimumChargeAdjustment },
      lineDescription: data.lineDescription,
      periodStart: data.chargePeriodStart,
      periodEnd: data.chargePeriodEnd,
      compensationCharge: this._asBoolean(data.regimeValue17),
      rebilledTransactionId: data.rebilledTransactionId,
      // For historical reasons, presroc factors are persisted in the db as a string which needs to have the factor
      // value extracted, whereas sroc factors are simply persisted as the value (but stored as a string so we must
      // parse it back to a number)
      section130Factor: data.ruleset === 'presroc' ? this._extractFactorFromString(data.lineAttr9) : this._asNumber(data.lineAttr9),
      // Note presroc stores the string to be parsed in `lineAttr10` whereas sroc stores the factor in `lineAttr15`
      section127Factor: data.ruleset === 'presroc' ? this._extractS127FactorFromString(data.lineAttr10) : this._asNumber(data.lineAttr15),
      // We only include winterOnlyFactor if the ruleset is `sroc`
      ...(data.ruleset === 'sroc') && { winterOnlyFactor: this._asNumber(data.lineAttr12) },
      calculation: data.chargeCalculation
    }
  }
}

module.exports = ViewTransactionPresenter
