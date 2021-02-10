'use strict'

const { CreateBillRunService } = require('../../../services')
const { BillRunGenerator } = require('../../../../test/support/generators')

class TestBillRunController {
  static async generate (req, h) {
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)

    const payload = {
      region: req.payload.region,
      mix: [
        { type: 'mixed-invoice', count: 2 },
        { type: 'mixed-credit', count: 2 },
        { type: 'zero-value', count: 2 },
        { type: 'deminimis', count: 2 },
        { type: 'minimum-charge', count: 2 }
      ]
    }

    BillRunGenerator.go(
      payload,
      result.billRun.id,
      req.auth.credentials.user,
      req.app.regime,
      req.server.logger
    )

    return h.response(result).code(201)
  }
}

module.exports = TestBillRunController
