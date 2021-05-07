'use strict'

const {
  DeleteInvoiceService,
  FetchAndValidateBillRunInvoiceService,
  ViewBillRunInvoiceService,
  InvoiceRebillingValidationService,
  InvoiceRebillingInitialiseService
} = require('../../services')
const InvoiceRebillingService = require('../../services/invoice_rebilling.service')

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
    const { billRun, invoice } = req.app

    // We perform validation within the controller so any errors are returned immediately
    await InvoiceRebillingValidationService.go(billRun, invoice)
    const { cancelInvoice, rebillInvoice, response } = await InvoiceRebillingInitialiseService.go(billRun, invoice)

    // We start InvoiceRebillingService without await so that it runs in the background
    InvoiceRebillingService.go(invoice, cancelInvoice, rebillInvoice)

    return h.response(response).code(201)
  }
}

module.exports = BillRunsInvoicesController
