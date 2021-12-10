'use strict'

/**
 * @module ViewTransactionPresenter
 */

const BasePresenter = require('./base.presenter')

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
      calculation: data.chargeCalculation
    }
  }
}

module.exports = ViewTransactionPresenter
