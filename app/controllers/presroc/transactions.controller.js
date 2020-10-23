'use strict'

const BaseTransactionsController = require('../base_transactions.controller')

class TransactionsController extends BaseTransactionsController {
  static async index (_req, _h) {
    return 'hello, pre-sroc transactions'
  }
}

module.exports = TransactionsController
