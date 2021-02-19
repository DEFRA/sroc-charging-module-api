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
  * @returns {module:BillRunModel} a `BillRunModel` if found else it will throw a `Boom` error
  */
  static async go (transaction) {
    const billRun = await BillRunModel.query().findById(transaction.billRunId)

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
