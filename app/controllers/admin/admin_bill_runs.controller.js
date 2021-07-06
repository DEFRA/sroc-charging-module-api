import AdminSendTransactionFileService from '../../services/admin_send_transaction_file.service.js'

export default class AdminBillRunsController {
  static async send (req, h) {
    await AdminSendTransactionFileService.go(req.app.regime, req.app.billRun)

    return h.response().code(204)
  }
}
