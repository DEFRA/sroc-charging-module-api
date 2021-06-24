const { BillRunModel } = require('../../../models')
const { CreateBillRunService } = require('../../../services')
const { BillRunGenerator } = require('../../../../test/support/generators')

class TestBillRunController {
  static async create (req, h) {
    const result = await CreateBillRunService.go(
      { region: req.payload.region },
      req.auth.credentials.user,
      req.app.regime
    )

    const billRun = await BillRunModel.query().findById(result.billRun.id)

    BillRunGenerator.go(
      req.payload,
      billRun,
      req.auth.credentials.user,
      req.app.regime,
      req.app.notifier
    )

    return h.response(result).code(201)
  }
}

module.exports = TestBillRunController
