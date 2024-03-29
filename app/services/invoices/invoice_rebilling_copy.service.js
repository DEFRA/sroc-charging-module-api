'use strict'

/**
 * @module InvoiceRebillingCopyService
 */

const InvoiceRebillingCreateLicenceService = require('./invoice_rebilling_create_licence.service.js')
const InvoiceRebillingCreateTransactionService = require('./invoice_rebilling_create_transaction.service.js')

const LicenceModel = require('../../models/licence.model.js')
const TransactionModel = require('../../models/transaction.model.js')

class InvoiceRebillingCopyService {
  /**
   * Service to copy an 'original' invoice to the 'cancel' and 'rebill' invoices
   *
   * For each licence in the `invoice`, it will create a corresponding licence on `cancelInvoice` and `rebillInvoice`
   * and populate it with copies of the transactions from the original licence (flipping them from credit to debit and
   * vice-versa as appropriate).
   *
   * The `cancelInvoice` and `rebillInvoice` are expected to be created by the `InvoiceRebillingInitialiseService` prior
   * to then being passed to this service.
   *
   * Note - The bill run, invoice and licence tallies will also be updated as part of the process.
   *
   * @param {module:InvoiceModel} invoice Instance of `InvoiceModel` for the invoice to be rebilled.
   * @param {module:InvoiceModel} cancelInvoice Instance of `InvoiceModel` for the cancelling invoice.
   * @param {module:InvoiceModel} rebillInvoice Instance of `InvoiceModel` for the rebilling invoice.
   * @param {module:AuthorisedSystemModel} authorisedSystem The authorised system making the rebilling request.
   */
  static async go (invoice, cancelInvoice, rebillInvoice, authorisedSystem) {
    const licences = await this._licences(invoice)

    await LicenceModel.transaction(async trx => {
      for (const licence of licences) {
        const cancelLicence = await InvoiceRebillingCreateLicenceService.go(cancelInvoice, licence.licenceNumber, trx)
        const rebillLicence = await InvoiceRebillingCreateLicenceService.go(rebillInvoice, licence.licenceNumber, trx)
        await this._populateRebillingLicences(invoice, licence, cancelLicence, rebillLicence, authorisedSystem, trx)
      }
    })
  }

  static async _populateRebillingLicences (invoice, licence, cancelLicence, rebillLicence, authorisedSystem, trx) {
    const transactions = await this._transactions(licence, trx)

    for (const transaction of transactions) {
      await InvoiceRebillingCreateTransactionService.go(transaction, rebillLicence, invoice, authorisedSystem, trx)
      await InvoiceRebillingCreateTransactionService.go(transaction, cancelLicence, invoice, authorisedSystem, trx, true)
    }
  }

  static _licences (invoice) {
    return LicenceModel.query()
      .where('invoiceId', invoice.id)
      .select(['id', 'licenceNumber'])
  }

  static _transactions (licence, trx) {
    return TransactionModel.query(trx)
      .where('licenceId', licence.id)
  }
}

module.exports = InvoiceRebillingCopyService
