'use strict'

/**
 * @module InvoiceRebillingService
 */

const InvoiceRebillingCreateLicenceService = require('./invoice_rebilling_create_licence.service')
const InvoiceRebillingCreateTransactionService = require('./invoice_rebilling_create_transaction.service')

const { LicenceModel, TransactionModel } = require('../models')

class InvoiceRebillingService {
  /**
   * Service to rebill a given invoice onto the supplied cancel invoice and rebill invoice.
   *
   * For each licence in the invoice, it will create a corresponding licence on cancelInvoice and rebillInvoice and
   * populate them with the transactions on the licence (flipping them from credit to debit and vice-versa as
   * appropriate).
   *
   * Note that bill run, invoice and licence tallies will be updated as part of the process.
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
        await this._populateRebillingLicences(licence, cancelLicence, rebillLicence, authorisedSystem, trx)
      }
    })
  }

  static async _populateRebillingLicences (licence, cancelLicence, rebillLicence, authorisedSystem, trx) {
    const transactions = await this._transactions(licence, trx)

    for (const transaction of transactions) {
      await InvoiceRebillingCreateTransactionService.go(transaction, rebillLicence, authorisedSystem, trx)
      await InvoiceRebillingCreateTransactionService.go(transaction, cancelLicence, authorisedSystem, trx, true)
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

module.exports = InvoiceRebillingService
