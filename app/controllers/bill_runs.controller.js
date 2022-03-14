'use strict'

const ApproveBillRunService = require('../services/bill_runs/approve_bill_run.service.js')
const BillRunStatusService = require('../services/bill_runs/bill_run_status.service.js')
const CreateBillRunService = require('../services/bill_runs/create_bill_run.service.js')
const CreateBillRunV2GuardService = require('../services/guards/create_bill_run_v2_guard.service.js')
const DeleteBillRunService = require('../services/bill_runs/delete_bill_run.service.js')
const GenerateBillRunService = require('../services/bill_runs/generate_bill_run.service.js')
const GenerateBillRunValidationService = require('../services/bill_runs/generate_bill_run_validation.service.js')
const SendBillRunReferenceService = require('../services/bill_runs/send_bill_run_reference.service.js')
const SendCustomerFileService = require('../services/files/customers/send_customer_file.service.js')
const SendTransactionFileService = require('../services/files/transactions/send_transaction_file.service.js')
const ViewBillRunService = require('../services/bill_runs/view_bill_run.service.js')

class BillRunsController {
  static async createV2 (req, h) {
    // Validate the v2 request and set v2 default
    await CreateBillRunV2GuardService.go(req.payload)
    req.payload.ruleset = 'presroc'

    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

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

module.exports = BillRunsController
