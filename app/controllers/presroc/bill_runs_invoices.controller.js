'use strict'

const {
  DeleteInvoiceService,
  ViewBillRunInvoiceService
} = require('../../services')

class BillRunsInvoicesController {
  static async delete (req, h) {
    DeleteInvoiceService.go(req.params.invoiceId, req.params.billRunId)

    return h.response().code(204)
  }

  static async view (req, h) {
    const result = await ViewBillRunInvoiceService.go(req.app.billRun.id, req.params.invoiceId)

    return h.response(result).code(200)
  }
}

module.exports = BillRunsInvoicesController
