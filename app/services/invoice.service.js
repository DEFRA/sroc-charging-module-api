'use strict'

/**
 * @module InvoiceService
 */

const { InvoiceModel } = require('../models')

class InvoiceService {
  static async go (billRunId, transaction) {
    const invoice = await this._invoice(billRunId, transaction.customerReference, transaction.financialYear)

    console.log(`INVOICESERVICE ${invoice instanceof InvoiceModel}`)
    this._populateStats(invoice, transaction)

    return invoice
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

  static _populateStats (invoice, transaction) {
    if (transaction.credit) {
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
