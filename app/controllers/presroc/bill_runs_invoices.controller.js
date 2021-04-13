'use strict'

const {
  DeleteInvoiceService,
  FetchAndValidateBillRunInvoiceService,
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
}

module.exports = BillRunsInvoicesController
