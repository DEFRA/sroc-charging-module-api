'use strict'

/**
 * @module InvoiceService
 */

const { LicenceModel } = require('../models')

class LicenceService {
  /**
  * Accepts a transaction and creates an entry in the Licences table if one doesn't already exist for the transaction's
  * invoice/licence/customer ref/financial year. It updates the count and value stats as per the transaction details
  * and returns the resulting licence.
  *
  * Note that the updated stats are _not_ saved back to the database; it is up to the caller to do this.
  *
  * @param {Object} A transaction object
  * @returns {Object} A licence object
  */

  static async go (transaction) {
    // licence number is lineAttr1 in database
    const licence = await this._licence(transaction)

    this._updateStats(licence, transaction)

    return licence
  }

  static async _licence ({
    invoiceId,
    billRunId,
    lineAttr1: licenceNumber
  }) {
    return LicenceModel.query()
      .findOrInsert(
        {
          invoiceId,
          billRunId,
          licenceNumber
        }
      )
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

module.exports = LicenceService
