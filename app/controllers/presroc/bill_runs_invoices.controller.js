'use strict'

const {
  DeleteInvoiceService,
  FetchAndValidateBillRunInvoiceService,
  InvoiceRebillingService,
  InvoiceRebillingValidationService,
  ViewBillRunInvoiceService
} = require('../../services')

class BillRunsInvoicesController {
  static async delete (req, h) {
    // We fetch and validate the invoice within the controller so a not found/conflict error is returned immediately
    const invoice = await FetchAndValidateBillRunInvoiceService.go(req.params.billRunId, req.params.invoiceId)

    // We start DeleteInvoiceService without await so that it runs in the background
    DeleteInvoiceService.go(invoice, req.params.billRunId, req.app.notifier)

    return h.response().code(204)
  }

  static async view (req, h) {
    const result = await ViewBillRunInvoiceService.go(req.app.billRun.id, req.params.invoiceId)

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
