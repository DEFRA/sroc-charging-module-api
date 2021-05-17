'use strict'

const { SendTransactionFileService } = require('../../services')

class AdminBillRunsController {
  static async send (req, h) {
    // Initiate generate/send process in the background
    SendTransactionFileService.go(req.app.regime, req.app.billRun, req.app.notifier)

    return h.response().code(204)
  }
}

module.exports = AdminBillRunsController
