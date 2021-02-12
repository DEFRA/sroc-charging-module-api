'use strict'

const { CreateBillRunService } = require('../../../services')
const { BillRunGenerator } = require('../../../../test/support/generators')

class TestBillRunController {
  static async generate (req, h) {
    const result = await CreateBillRunService.go(
      { region: req.payload.region },
      req.auth.credentials.user,
      req.app.regime
    )

    BillRunGenerator.go(
      req.payload,
      result.billRun.id,
      req.auth.credentials.user,
      req.app.regime,
      req.server.logger
    )

    return h.response(result).code(201)
  }
}

module.exports = TestBillRunController
