'use strict'

const {
  CreateTransactionBillRunValidationService,
  CreateTransactionService
} = require('../../services')

class BillRunsTransactionsController {
  static async create (req, h) {
    await CreateTransactionBillRunValidationService.go(req.app.billRun, req.payload.region)

    const result = await CreateTransactionService.go(req.payload, req.app.billRun, req.auth.credentials.user, req.app.regime)

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
