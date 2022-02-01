'use strict'

const {
  CreateTransactionService,
  CreateTransactionV2GuardService,
  ValidateBillRunRegion
} = require('../services')

class BillRunsTransactionsController {
  static async createV2 (req, h) {
    // Guard service checks that the v2 Create Transaction request is for presroc and throws an error if not
    await CreateTransactionV2GuardService.go(req.app.billRun)

    await ValidateBillRunRegion.go(req.app.billRun, req.payload.region)

    const result = await CreateTransactionService.go(req.payload, req.app.billRun, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async create (req, h) {
    await ValidateBillRunRegion.go(req.app.billRun, req.payload.region)

    const result = await CreateTransactionService.go(req.payload, req.app.billRun, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }
}

module.exports = BillRunsTransactionsController
