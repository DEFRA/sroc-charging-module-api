'use strict'

/**
 * @module CreateTransactionInvoiceService
 */

const { InvoiceModel } = require('../models')
const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionInvoiceService {
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

    return this._generatePatch(invoice.id, transaction)
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

  static async _generatePatch (id, transaction) {
    const patch = {
      id: id,
      update: await CreateTransactionTallyService.go(transaction)
    }

    return patch
  }
}

module.exports = CreateTransactionInvoiceService
