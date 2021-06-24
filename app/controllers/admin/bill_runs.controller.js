const { AdminSendTransactionFileService } = require('../../services')

class AdminBillRunsController {
  static async send (req, h) {
    await AdminSendTransactionFileService.go(req.app.regime, req.app.billRun)

    return h.response().code(204)
  }
}

module.exports = AdminBillRunsController
