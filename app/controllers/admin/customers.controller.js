'use strict'

const { SendCustomerFileService } = require('../../services')
const { StaticLookup } = require('../../lib')

class CustomersController {
  static async send (req, h) {
    const regions = StaticLookup.regions

    // Initiate generate/send process in the background
    SendCustomerFileService.go(req.app.regime, regions, req.app.notifier)

    return h.response().code(204)
  }
}

module.exports = CustomersController
