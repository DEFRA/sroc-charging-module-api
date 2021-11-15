'use strict'

const {
  ValidateBillRunRegion,
  CreateTransactionService
} = require('../services')

class BillRunsTransactionsController {
  static async create (req, h) {
    // Set default ruleset -- this controller will become the v2 controller in a future PR
    req.payload.ruleset = 'presroc'

    await ValidateBillRunRegion.go(req.app.billRun, req.payload.region)

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
