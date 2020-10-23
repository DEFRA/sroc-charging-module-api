'use strict'

const BaseTransactionsController = require('../base_transactions.controller')

class TransactionsController extends BaseTransactionsController {
  static async index (req, h) {
    return 'hello, sroc transactions'
  }
}

module.exports = TransactionsController
