import ApproveBillRunService from '../../services/approve_bill_run.service.js'
import BillRunStatusService from '../../services/bill_run_status.service.js'
import CreateBillRunService from '../../services/create_bill_run.service.js'
import DeleteBillRunService from '../../services/delete_bill_run.service.js'
import GenerateBillRunService from '../../services/generate_bill_run.service.js'
import GenerateBillRunValidationService from '../../services/generate_bill_run_validation.service.js'
import SendBillRunReferenceService from '../../services/send_bill_run_reference.service.js'
import SendCustomerFileService from '../../services/send_customer_file.service.js'
import SendTransactionFileService from '../../services/send_transaction_file.service.js'
import ViewBillRunService from '../../services/view_bill_run.service.js'

export default class BillRunsController {
  static async create (req, h) {
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async view (req, h) {
    const result = await ViewBillRunService.go(req.params.billRunId)

    return h.response(result).code(200)
  }

  static async generate (req, h) {
    await GenerateBillRunValidationService.go(req.app.billRun)
    GenerateBillRunService.go(req.app.billRun, req.app.notifier)

    return h.response().code(204)
  }

  static async status (req, h) {
    const result = await BillRunStatusService.go(req.app.billRun)

    return h.response(result).code(200)
  }

  static async approve (req, h) {
    await ApproveBillRunService.go(req.app.billRun)

    return h.response().code(204)
  }

  static async send (req, h) {
    const sentBillRun = await SendBillRunReferenceService.go(req.app.regime, req.app.billRun)

    SendTransactionFileService.go(req.app.regime, sentBillRun, req.app.notifier)
    SendCustomerFileService.go(req.app.regime, [sentBillRun.region], req.app.notifier)

    return h.response().code(204)
  }

  static async delete (req, h) {
    DeleteBillRunService.go(req.app.billRun, req.app.notifier)

    return h.response().code(204)
  }
}
