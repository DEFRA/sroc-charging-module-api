'use strict'

class TransactionsController {
  static async index (_req, _h) {
    return 'hello, pre-sroc transactions'
  }
}

module.exports = TransactionsController
