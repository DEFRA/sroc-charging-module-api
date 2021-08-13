'use strict'

const { DataExportService } = require('../../../services')

class TestDataExportController {
  static async export (req, h) {
    const result = await DataExportService.go(req.app.notifier)
    const statusCode = result ? 204 : 400

    return h.response().code(statusCode)
  }
}

module.exports = TestDataExportController
