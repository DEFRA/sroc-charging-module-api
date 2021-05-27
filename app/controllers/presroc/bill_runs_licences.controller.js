'use strict'

class BillRunsLicencesController {
  static async delete (req, h) {
    return h.response().code(204)
  }
}

module.exports = BillRunsLicencesController
