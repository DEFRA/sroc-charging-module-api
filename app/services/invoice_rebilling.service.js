'use strict'

/**
 * @module InvoiceRebillingService
 */

const { InvoiceRebillingPresenter } = require('../presenters')
const InvoiceRebillingInitialiseService = require('./invoice_rebilling_initialise.service')
const InvoiceRebillingCopyService = require('./invoice_rebilling_copy.service')

class InvoiceRebillingService {
  /**
   *
   * @param {module:BillRunModel} billRun An instance of `BillRunModel` of the bill run to add the invoices to.
   * @param {module:InvoiceModel} invoice An instance of `InvoiceModel` of the invoice to be rebilled.
   * @param {module:AuthorisedSystemModel} authorisedSystem The authorised system making the rebilling request.
   * @param {@module:RequestNotifierLib} notifier Instance of `RequestNotifierLib` class. We use it to log errors rather
   * than throwing them as this service is intended to run in the background.
   *
   * @returns {Object} Details of the newly created 'cancel' and 'rebill' invoices
   */
  static async go (billRun, originalInvoice, authorisedSystem, notifier) {
    const { cancelInvoice, rebillInvoice } = await InvoiceRebillingInitialiseService.go(billRun, originalInvoice)

    try {
      // We start InvoiceRebillingCopyService without await so that it runs in the background
      InvoiceRebillingCopyService.go(originalInvoice, cancelInvoice, rebillInvoice, authorisedSystem)
    } catch (error) {
      notifier.omfg('Error rebilling invoice', { id: originalInvoice.id, error })
    }

    return this._response(cancelInvoice, rebillInvoice)
  }

  static _response (cancelInvoice, rebillInvoice) {
    const presenter = new InvoiceRebillingPresenter([cancelInvoice, rebillInvoice])

    return presenter.go()
  }
}

module.exports = InvoiceRebillingService
