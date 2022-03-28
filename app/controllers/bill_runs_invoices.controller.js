'use strict'

const DeleteInvoiceService = require('../services/invoices/delete_invoice.service.js')
const InvoiceRebillingService = require('../services/invoices/invoice_rebilling.service.js')
const InvoiceRebillingValidationService = require('../services/invoices/invoice_rebilling_validation.service.js')
const ValidateInvoiceService = require('../services/invoices/validate_invoice.service.js')
const ViewInvoiceService = require('../services/invoices/view_invoice.service.js')

class BillRunsInvoicesController {
  static async delete (req, h) {
    // We validate that the invoice is linked to the bill run within the controller so a not found/conflict error is
    // returned immediately
    await ValidateInvoiceService.go(req.app.billRun, req.app.invoice)

    // We start DeleteInvoiceService without await so that it runs in the background
    DeleteInvoiceService.go(req.app.invoice, req.app.billRun, req.app.notifier)

    return h.response().code(204)
  }

  static async view (req, h) {
    const result = await ViewInvoiceService.go(req.app.billRun, req.app.invoice)

    return h.response(result).code(200)
  }

  static async rebill (req, h) {
    const { billRun, invoice, notifier } = req.app

    // We perform validation within the controller so any errors are returned immediately
    await InvoiceRebillingValidationService.go(billRun, invoice)

    // We await the InvoiceRebillingService in order to generate the cancel and rebill invoice and the response back to
    // the client system. But is also kicks off a background task to perform the actual copying of the transactions
    // and licences from the original invoice.
    const result = await InvoiceRebillingService.go(billRun, invoice, req.auth.credentials.user, notifier)

    return h.response(result).code(201)
  }
}

module.exports = BillRunsInvoicesController
