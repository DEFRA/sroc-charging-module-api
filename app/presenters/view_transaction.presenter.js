/**
 * @module ViewTransactionPresenter
 */

import BasePresenter from './base.presenter.js'

/**
 * Handles formatting the transaction data into the response we send to clients when a GET request is received
 */
export default class ViewTransactionPresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      clientId: data.clientId,
      chargeValue: data.chargeValue,
      credit: data.chargeCredit,
      subjectToMinimumCharge: data.subjectToMinimumCharge,
      minimumChargeAdjustment: data.minimumChargeAdjustment,
      lineDescription: data.lineDescription,
      periodStart: data.chargePeriodStart,
      periodEnd: data.chargePeriodEnd,
      compensationCharge: this._asBoolean(data.regimeValue17),
      rebilledTransactionId: data.rebilledTransactionId,
      calculation: data.chargeCalculation
    }
  }
}
