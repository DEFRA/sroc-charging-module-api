'use strict'

const { ListCustomerFilesService, ShowCustomerFileService } = require('../../../services')

class TestCustomerFilesController {
  static async index (req, h) {
    const result = await ListCustomerFilesService.go(req.app.regime)

    return h.response(result).code(200)
  }

  static async show (req, h) {
    const result = await ShowCustomerFileService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = TestCustomerFilesController
