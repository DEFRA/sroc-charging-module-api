'use strict'

class InvoicesController {
  static async delete (req, h) {
    return h.response().code(200)
  }
}

module.exports = InvoicesController
