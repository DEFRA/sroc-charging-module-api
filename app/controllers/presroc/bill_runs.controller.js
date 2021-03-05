'use strict'

const {
  ApproveBillRunService,
  BillRunStatusService,
  CreateBillRunService,
  GenerateBillRunService,
  GenerateBillRunValidationService,
  ViewBillRunService
} = require('../../services')

class BillRunsController {
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
    GenerateBillRunService.go(req.app.billRun, req.server.logger)

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
    if (req.app.billRun.status === 'approved') {
      return h.response().code(204)
    } else {
      const Boom = require('@hapi/boom')
      throw Boom.conflict(`Bill run ${req.app.billRun.id} does not have a status of 'approved'.`)
    }
  }

  static async delete (req, h) {
    return h.response().code(204)
  }
}

module.exports = BillRunsController
