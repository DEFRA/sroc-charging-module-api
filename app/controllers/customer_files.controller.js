'use strict'

const { ListCustomerFilesService } = require('../services')

class CustomerFilesController {
  static async index (req, h) {
    const result = await ListCustomerFilesService.go()

    return h.response(result).code(200)
  }
}

module.exports = CustomerFilesController
