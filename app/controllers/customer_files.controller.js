'use strict'

class CustomerFilesController {
  static async index (req, h) {
    return h.response().code(204)
  }
}

module.exports = CustomerFilesController
