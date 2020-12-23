'use strict'

const { CreateBillRunService } = require('../../services')

class BillRunsController {
  static async create (req, h) {
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async createTransaction (_req, _h) {
    return 'hello, pre-sroc add bill run transaction'
  }
}

module.exports = BillRunsController
