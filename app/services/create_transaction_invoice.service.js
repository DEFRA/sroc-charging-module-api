'use strict'

/**
 * @module InvoiceService
 */

const { InvoiceModel } = require('../models')

class InvoiceService {
/**
* Accepts a transaction and creates an entry in the Invoices table if one doesn't already exist for the transaction's
* bill run/customer/financial year. It updates the count and value stats as per the transaction details and returns the
* resulting invoice.
*
* Note that the updated stats are _not_ saved back to the database; it is up to the caller to do this.
*
* @param {Object} A transaction object
* @returns {Object} An invoice object
*/

  static async go (transaction) {
    const invoice = await this._invoice(transaction)

    this._updateStats(invoice, transaction)

    return invoice
  }

  static async _invoice ({
    billRunId,
    customerReference,
    chargeFinancialYear: financialYear
  }) {
    return InvoiceModel.query()
      .findOrInsert(
        {
          billRunId,
          customerReference,
          financialYear
        }
      )
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

module.exports = InvoiceService
