'use strict'

/**
 * @module InvoiceService
 */

const { InvoiceModel } = require('../models')
const Hoek = require('@hapi/hoek')

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

    const updatedInvoice = this._updateStats(invoice, transaction)

    return updatedInvoice
  }

  static _invoice (billRunId, customerReference, financialYear) {
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
    const updatedInvoice = Hoek.clone(invoice)

    if (transaction.chargeCredit) {
      updatedInvoice.creditCount += 1
      updatedInvoice.creditValue += transaction.chargeValue
    } else if (transaction.chargeValue === 0) {
      updatedInvoice.zeroCount += 1
    } else {
      updatedInvoice.debitCount += 1
      updatedInvoice.debitValue += transaction.chargeValue
    }

    if (transaction.newLicence) {
      updatedInvoice.newLicenceCount += 1
    }

    return updatedInvoice
  }
}

module.exports = InvoiceService
