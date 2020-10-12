const BaseTransactionsController = require('../base_transactions.controller')

class TransactionsController extends BaseTransactionsController {
  static async index (req, h) {
    return 'hello, pre-sroc transactions'
  }
}

module.exports = TransactionsController
