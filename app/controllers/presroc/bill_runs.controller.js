const BaseBillRunsController = require('../base_bill_runs.controller')

class BillRunsController extends BaseBillRunsController {
  static async index (req, h) {
    return 'hello, pre-sroc billruns'
  }
}

module.exports = BillRunsController
