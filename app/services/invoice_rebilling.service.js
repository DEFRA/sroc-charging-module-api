'use strict'

/**
 * @module InvoiceRebillingService
 */

const InvoiceRebillingCreateLicenceService = require('./invoice_rebilling_create_licence.service')
const InvoiceRebillingCreateTransactionService = require('./invoice_rebilling_create_transaction.service')

const { LicenceModel, TransactionModel } = require('../models')

class InvoiceRebillingService {
  /**
   *
   */
  static async go (invoice, cancelInvoice, rebillInvoice) {
    const licences = await this._licences(invoice)

    for (const licence of licences) {
      const cancelLicence = await InvoiceRebillingCreateLicenceService.go(cancelInvoice, licence.licenceNumber)
      const rebillLicence = await InvoiceRebillingCreateLicenceService.go(rebillInvoice, licence.licenceNumber)
      await this._populateRebillingLicences(licence, cancelLicence, rebillLicence)
    }
  }

  static async _populateRebillingLicences (licence, cancelLicence, rebillLicence) {
    const transactions = await this._transactions(licence)

    for (const transaction of transactions) {
      await InvoiceRebillingCreateTransactionService.go(transaction, rebillLicence)
      await InvoiceRebillingCreateTransactionService.go(transaction, cancelLicence, true)
    }
  }

  static _licences (invoice) {
    return LicenceModel.query()
      .where('invoiceId', invoice.id)
      .select(['id', 'licenceNumber'])
  }

  static _transactions (licence) {
    return TransactionModel.query()
      .where('licenceId', licence.id)
  }
}

module.exports = InvoiceRebillingService
