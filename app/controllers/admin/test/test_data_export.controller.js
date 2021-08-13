'use strict'

const { DataExportService } = require('../../../services')

class TestDataExportController {
  static async export (req, h) {
    const result = await DataExportService.go(req.app.notifier)
    const statusCode = result ? 200 : 400

    return h.response().code(statusCode)
  }
}

module.exports = TestDataExportController
