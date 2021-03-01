'use strict'

/**
 * @module BillRunService
 */

const Boom = require('@hapi/boom')

class BillRunService {
  /**
  * Determines if a transaction is for the same region as the requested bill run and if so, updates the bill run's count
  * and value stats based on the transaction details
  *
  * Note - The updated stats are _not_ saved back to the database; it is up to the caller to do this.
  *
  * @param {module:BillRunModel} billRun the bill run this transaction is being added to
  * @param {module:TransactionTranslator} transaction translator representing the transaction to be added
  *
  * @returns {module:BillRunModel} the updated (but not persisted) instance of `BillRunModel`
  */
  static async go (billRun, transaction) {
    this._validateBillRun(billRun, transaction)
    this._updateStats(billRun, transaction)

    return billRun
  }

  static _validateBillRun (billRun, transaction) {
    if (!billRun) {
      throw Boom.badData(`Bill run ${transaction.billRunId} is unknown.`)
    }

    if (!billRun.$editable()) {
      throw Boom.badData(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }

    if (billRun.region !== transaction.region) {
      throw Boom.badData(
        `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${transaction.region}.`
      )
    }
  }

  static _updateStats (object, transaction) {
    if (transaction.chargeCredit) {
      object.creditLineCount += 1
      object.creditLineValue += transaction.chargeValue
      object.subjectToMinimumChargeCreditValue += transaction.subjectToMinimumCharge ? transaction.chargeValue : 0
    } else if (transaction.chargeValue === 0) {
      object.zeroLineCount += 1
    } else {
      object.debitLineCount += 1
      object.debitLineValue += transaction.chargeValue
      object.subjectToMinimumChargeDebitValue += transaction.subjectToMinimumCharge ? transaction.chargeValue : 0
    }

    if (transaction.subjectToMinimumCharge) {
      object.subjectToMinimumChargeCount += 1
    }
  }
}

module.exports = BillRunService
