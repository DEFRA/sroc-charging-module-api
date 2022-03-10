'use strict'

const DeleteLicenceService = require('../services/licences/delete_licence.service')
const ValidateBillRunLicenceService = require('../services/licences/validate_bill_run_licence.service')

class BillRunsLicencesController {
  static async delete (req, h) {
    // We validate the licence within the controller so a validation error is returned immediately
    await ValidateBillRunLicenceService.go(req.app.billRun.id, req.app.licence)

    // We start DeleteLicenceService without await so that it runs in the background
    DeleteLicenceService.go(req.app.licence, req.app.billRun, req.app.notifier)

    return h.response().code(204)
  }
}

module.exports = BillRunsLicencesController
