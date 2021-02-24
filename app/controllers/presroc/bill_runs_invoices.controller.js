'use strict'

class BillRunsInvoicesController {
  static async delete (req, h) {
    return h.response().code(200)
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
