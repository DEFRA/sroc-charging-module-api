'use strict'

const ExportDataFiles = require('../../../services/files/exports/export_data_files.service')

class TestDataExportController {
  static async export (req, h) {
    const result = await ExportDataFiles.go(req.app.notifier)
    const statusCode = result ? 204 : 400

    return h.response().code(statusCode)
  }
}

module.exports = TestDataExportController
