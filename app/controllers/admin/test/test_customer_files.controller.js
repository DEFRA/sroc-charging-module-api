'use strict'

const { ListCustomerFilesService } = require('../../../services')

class TestCustomerFilesController {
  static async index (req, h) {
    const result = await ListCustomerFilesService.go(req.app.regime)

    return h.response(result).code(200)
  }
}

module.exports = TestCustomerFilesController
