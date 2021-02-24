'use strict'

const {
  CreateTransactionService
} = require('../../services')

class BillRunsTransactionsController {
  static async create (req, h) {
    const result = await CreateTransactionService.go(req.payload, req.params.billRunId, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async view (req, h) {
    const result = {
      transaction: {
        id: req.params.transactionId
      }
    }

    return h.response(result).code(200)
  }
}

module.exports = BillRunsTransactionsController
