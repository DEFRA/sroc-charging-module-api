import BillRunModel from '../../../models/bill_run.model.js'
import CreateBillRunService from '../../../services/create_bill_run.service.js'
import BillRunGenerator from '../../../../test/support/generators/bill_run.generator.js'

export default class TestBillRunController {
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
