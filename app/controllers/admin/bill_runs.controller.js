'use strict'

const { AdminSendTransactionFileService } = require('../../services')

class AdminBillRunsController {
  static async send (_req, h) {
    await AdminSendTransactionFileService.go()

    return h.response().code(200)
  }
}

module.exports = AdminBillRunsController
