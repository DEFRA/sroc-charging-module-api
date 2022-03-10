'use strict'

const ListCustomerFilesService = require('../services/files/customers/list_customer_files.service')

class CustomerFilesController {
  static async index (req, h) {
    const result = await ListCustomerFilesService.go(req.app.regime, req.params.days)

    return h.response(result).code(200)
  }
}

module.exports = CustomerFilesController
