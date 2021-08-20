'use strict'

const { DeleteLicenceService, ValidateBillRunLicenceService } = require('../services')

class BillRunsLicencesController {
  static async delete (req, h) {
    // We validate the licence within the controller so a validation error is returned immediately
    await ValidateBillRunLicenceService.go(req.app.billRun.id, req.app.licence)

    // We start DeleteLicenceService without await so that it runs in the background
    DeleteLicenceService.go(req.app.licence, req.app.notifier)

    return h.response().code(204)
  }
}

module.exports = BillRunsLicencesController
