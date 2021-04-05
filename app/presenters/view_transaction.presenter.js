'use strict'

/**
 * @module ViewTransactionPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the transaction data into the response we send to clients when a GET request is received
 */
class ViewTransactionPresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      clientId: data.clientId,
      chargeValue: data.chargeValue,
      credit: data.chargeCredit,
      status: data.status,
      subjectToMinimumCharge: data.subjectToMinimumCharge,
      minimumChargeAdjustment: data.minimumChargeAdjustment,
      lineDescription: data.lineDescription,
      periodStart: data.chargePeriodStart,
      periodEnd: data.chargePeriodEnd,
      compensationCharge: this._asBoolean(data.regimeValue17),
      calculation: data.chargeCalculation
    }
  }
}

module.exports = ViewTransactionPresenter
