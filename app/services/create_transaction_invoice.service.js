'use strict'

/**
 * @module CreateTransactionInvoiceService
 */

const { InvoiceModel } = require('../models')
const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionInvoiceService {
  /**
  * Creates or finds the invoice record then generates and returns a 'patch' object to be used to update it based on
  * values in the transaction
  *
  * The service accepts a transaction and creates an entry in the `invoices` table if one doesn't already exist for the
  * transaction's 'bill run ID/customer ref/financial year' combo. It then generates a 'patch' object intended to be
  * used in a call to `InvoiceModel.query().patch()`. The 'patch' object has 2 properties
  *
  * - the ID of the invoice to update (determined by either the fetched or created `invoice`)
  * - a child object specifiying which fields to update and how
  *
  * A full example would be
  *
  * ```
  * const patchObject = await CreateTransactionInvoiceService.go(transaction)
  * await InvoiceModel.query().findById(patchObject.id).patch(patchObject.update)
  * ```
  *
  * Note - Our experience is that patching a record in this way is more performant than updating the instance and
  * calling `$patch()` on it.
  *
  * @param {module:TransactionTranslator} transaction translator representing the transaction to be added
  *
  * @returns {Object} an object that contains the ID of the invoice to be updated, and the updates to be applied
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
    const tallyObject = await CreateTransactionTallyService.go(transaction, InvoiceModel.tableName)
    const patch = {
      id,
      update: tallyObject.patch
    }

    return patch
  }
}

module.exports = CreateTransactionInvoiceService
