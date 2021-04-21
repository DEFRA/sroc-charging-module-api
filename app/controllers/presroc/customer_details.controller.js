'use strict'

const { CreateCustomerDetailsService } = require('../../services')

class PresrocCustomerDetailsController {
  static async create (req, h) {
    await CreateCustomerDetailsService.go(req.payload, req.app.regime)

    return h.response().code(201)
  }
}

module.exports = PresrocCustomerDetailsController
