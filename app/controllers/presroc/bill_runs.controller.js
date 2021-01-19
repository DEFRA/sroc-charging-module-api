'use strict'

const { CreateBillRunService, CreateTransactionService, GenerateBillRunSummaryService } = require('../../services')

class BillRunsController {
  static async create (req, h) {
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async createTransaction (req, h) {
    const result = await CreateTransactionService.go(req.payload, req.params.billRunId, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async generateSummary (req, h) {
    // TODO: confirm whether await is needed here
    await GenerateBillRunSummaryService.go(req.params.billRunId)

    return h.response().code(204)
  }
}

module.exports = BillRunsController
