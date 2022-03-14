'use strict'

const BillRunModel = require('../../../models/bill_run.model.js')
const CreateBillRunService = require('../../../services/bill_runs/create_bill_run.service.js')
const BillRunGenerator = require('../../../../test/support/generators/bill_run.generator.js')

class TestBillRunController {
  static async create (req, h) {
    const result = await CreateBillRunService.go(
      {
        region: req.payload.region,
        ruleset: 'presroc'
      },
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
