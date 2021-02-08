'use strict'

const {
  BillRunStatusService,
  CreateBillRunService,
  CreateTransactionService,
  GenerateBillRunService,
  ValidateBillRunService
} = require('../../services')

class BillRunsController {
  static async create (req, h) {
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async createTransaction (req, h) {
    const result = await CreateTransactionService.go(req.payload, req.params.billRunId, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async generate (req, h) {
    await ValidateBillRunService.go(req.params.billRunId)
    GenerateBillRunService.go(req.params.billRunId)

    return h.response().code(204)
  }

  static async status (req, h) {
    const result = await BillRunStatusService.go(req.params.billRunId)

    return h.response(result).code(200)
  }
}

module.exports = BillRunsController
