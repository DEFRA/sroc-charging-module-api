'use strict'

const { ViewTransactionService } = require('../../../services')

class TestTransactionsController {
  static async view (req, h) {
    const result = await ViewTransactionService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = TestTransactionsController
