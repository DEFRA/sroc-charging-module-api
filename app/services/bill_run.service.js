'use strict'

/**
 * @module BillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')

class BillRunService {
  /**
  * Finds the matching bill run, determines if a transaction can be added to it and updates the count and value stat
  * as per the transaction details.
  *
  * Note that the updated stats are _not_ saved back to the database; it is up to the caller to do this.
  *
  * @param {Object} transaction translator belonging to the bill run to find and assess
  * @param {boolean} [requestFromGenerateBillRun=false] If `true` then we are updating the summary within the 'generate bill run'
  *  process and we should therefore expect the bill run to be in $generating state
  * @returns {module:BillRunModel} a `BillRunModel` if found else it will throw a `Boom` error
  */
  static async go (transaction, requestFromGenerateBillRun = false) {
    const billRun = await BillRunModel.query().findById(transaction.billRunId)

    this._validateBillRun(billRun, transaction, requestFromGenerateBillRun)
    this._updateStats(billRun, transaction)

    return billRun
  }

  static _validateBillRun (billRun, transaction, requestFromGenerateBillRun) {
    if (!billRun) {
      throw Boom.badData(`Bill run ${transaction.billRunId} is unknown.`)
    }

    if (!this._updateable(billRun, requestFromGenerateBillRun)) {
      throw Boom.badData(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }

    if (billRun.region !== transaction.region) {
      throw Boom.badData(
        `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${transaction.region}.`
      )
    }
  }

  /**
   * The bill run can be updated in the following circumstances:
   *  - The bill run state is $editable;
   *  - The bill run state is $generating and the service has been called as part of the bill run generation process
   *     (which will pass requestFromGenerateBillRun as true)
   */
  static _updateable (billRun, requestFromGenerateBillRun) {
    return billRun.$editable() || (billRun.$generating() && requestFromGenerateBillRun)
  }

  static _updateStats (object, transaction) {
    if (transaction.chargeCredit) {
      object.creditCount += 1
      object.creditValue += transaction.chargeValue
      object.subjectToMinimumChargeCreditValue += transaction.subjectToMinimumCharge ? transaction.chargeValue : 0
    } else if (transaction.chargeValue === 0) {
      object.zeroCount += 1
    } else {
      object.debitCount += 1
      object.debitValue += transaction.chargeValue
      object.subjectToMinimumChargeDebitValue += transaction.subjectToMinimumCharge ? transaction.chargeValue : 0
    }

    if (transaction.subjectToMinimumCharge) {
      object.subjectToMinimumChargeCount += 1
    }
  }
}

module.exports = BillRunService
