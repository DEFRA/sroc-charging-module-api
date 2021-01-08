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
    const invoice = await this._invoice(transaction.billRunId, transaction.customerReference, transaction.chargeFinancialYear)

    this._updateStats(invoice, transaction)

    return invoice
  }

  static async _invoice (billRunId, customerReference, financialYear) {
    return InvoiceModel.query()
      .findOrInsert(
        {
          bill_run_id: billRunId,
          customer_reference: customerReference,
          financial_year: financialYear
        }
      )
  }

  static _updateStats (invoice, transaction) {
    if (transaction.chargeCredit) {
      invoice.creditCount += 1
      invoice.creditValue += transaction.chargeValue
    } else if (transaction.chargeValue === 0) {
      invoice.zeroCount += 1
    } else {
      invoice.debitCount += 1
      invoice.debitValue += transaction.chargeValue
    }

    if (transaction.newLicence) {
      invoice.newLicenceCount += 1
    }
  }
}

module.exports = InvoiceService
