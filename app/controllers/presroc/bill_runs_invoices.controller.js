'use strict'

const {
  DeleteInvoiceService
} = require('../../services')

class BillRunsInvoicesController {
  static async delete (req, h) {
    await DeleteInvoiceService.go(req.params.invoiceId, req.params.billRunId)

    return h.response().code(204)
  }

  static async view (req, h) {
    const result = {
      invoice: {
        id: req.params.invoiceId
      }
    }

    return h.response(result).code(200)
  }
}

module.exports = BillRunsInvoicesController
