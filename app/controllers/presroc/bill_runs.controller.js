'use strict'

const { CreateBillRunService, CreateBillRunTransactionService } = require('../../services')

class BillRunsController {
  static async create (req, h) {
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async createTransaction (req, h) {
    const result = await CreateBillRunTransactionService.go(
      req.payload,
      req.params.billRunId,
      req.auth.credentials.user,
      req.app.regime
    )

    return h.response(result).code(201)
  }
}

module.exports = BillRunsController
