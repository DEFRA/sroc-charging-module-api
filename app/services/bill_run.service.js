'use strict'

/**
 * @module BillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')

class BillRunService {
  /**
  * Finds the matching bill run, determines if a transaction can be added to it and updates updates the count and value
  * stats as per the transaction details.
  *
  * Note that the updated stats are _not_ saved back to the database; it is up to the caller to do this.
  *
  * @param {Object} transaction translator belonging to the bill run to find and assess
  * @returns {module:BillRunModel} a `BillRunModel` if found else it will throw a `Boom` error
  */
  static async go (transaction) {
    const billRun = await BillRunModel.query().findById(transaction.billRunId)

    this._validateBillRun(billRun, transaction.billRunId)
    this._updateStats(billRun, transaction)

    return billRun
  }

  static _validateBillRun (billRun, billRunId) {
    if (!billRun) {
      throw Boom.badData(`Bill run ${billRunId} is unknown.`)
    }

    if (!billRun.$editable()) {
      throw Boom.badData(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }
  }

  static _updateStats (billRun, transaction) {
    if (transaction.chargeCredit) {
      billRun.creditCount += 1
      billRun.creditValue += transaction.chargeValue
    } else if (transaction.chargeValue === 0) {
      billRun.zeroCount += 1
    } else {
      billRun.debitCount += 1
      billRun.debitValue += transaction.chargeValue
    }

    if (transaction.newLicence) {
      billRun.newLicenceCount += 1
    }
  }
}

module.exports = BillRunService
