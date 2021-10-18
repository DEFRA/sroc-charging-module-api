'use strict'

const {
  ApproveBillRunService,
  BillRunStatusService,
  CreateBillRunService,
  CreateBillRunV2GuardService,
  DeleteBillRunService,
  GenerateBillRunService,
  GenerateBillRunValidationService,
  SendBillRunReferenceService,
  SendCustomerFileService,
  SendTransactionFileService,
  ViewBillRunService
} = require('../services')

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
