'use strict'

const { ListCustomerFilesService, ViewCustomerFileService } = require('../../../services')

class TestCustomerFilesController {
  static async index (req, h) {
    const result = await ListCustomerFilesService.go(req.app.regime)

    return h.response(result).code(200)
  }

  static async view (req, h) {
    const result = await ViewCustomerFileService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = TestCustomerFilesController
