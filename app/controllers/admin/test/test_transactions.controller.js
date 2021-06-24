const { ShowTransactionService } = require('../../../services')

class TestTransactionsController {
  static async show (req, h) {
    const result = await ShowTransactionService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = TestTransactionsController
