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
  * @param {boolean} requestFromGenerateBillRun If true then we are updating the summary within the 'generate bill run'
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

    /**
     * Test if the bill run is $editable, or if it's being called as part of the bill run generation process, and
     * reject if it isn't.
     */
    const partOfBillRunGeneration = this._partOfBillRunGeneration(billRun, requestFromGenerateBillRun)
    if (!billRun.$editable() && !partOfBillRunGeneration) {
      throw Boom.badData(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }

    if (billRun.region !== transaction.region) {
      throw Boom.badData(
        `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${transaction.region}.`
      )
    }
  }

  /**
   * We know that the service has been called as part of the bill run generation process if requestFromGenerateBillRun
   * has been passed in as true and the bill run state is $generating.
   */
  static _partOfBillRunGeneration (billRun, requestFromGenerateBillRun) {
    return requestFromGenerateBillRun && billRun.$generating()
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
