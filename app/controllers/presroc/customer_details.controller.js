'use strict'

const { CreateCustomerDetailsService } = require('../../services')

class PresrocCustomerDetailsController {
  static async create (req, h) {
    const response = await CreateCustomerDetailsService.go(req.payload, req.app.regime)
    console.log(response)
    return h.response().code(204)
  }
}

module.exports = PresrocCustomerDetailsController
