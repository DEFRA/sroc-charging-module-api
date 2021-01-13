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
    const licence = await this._licence(
      transaction.invoiceId,
      transaction.billRunId,
      transaction.lineAttr1,
      transaction.customerReference,
      transaction.chargeFinancialYear
    )

    this._updateStats(licence, transaction)

    return licence
  }

  static async _licence (invoiceId, billRunId, licenceNumber, customerReference, financialYear) {
    return LicenceModel.query()
      .findOrInsert(
        {
          invoice_id: invoiceId,
          bill_run_id: billRunId,
          licence_number: licenceNumber,
          customer_reference: customerReference,
          financial_year: financialYear
        }
      )
  }

  static _updateStats (licence, transaction) {
    if (transaction.chargeCredit) {
      licence.creditCount += 1
      licence.creditValue += transaction.chargeValue
    } else if (transaction.chargeValue === 0) {
      licence.zeroCount += 1
    } else {
      licence.debitCount += 1
      licence.debitValue += transaction.chargeValue
    }

    if (transaction.newLicence) {
      licence.newLicenceCount += 1
    }
  }
}

module.exports = LicenceService
