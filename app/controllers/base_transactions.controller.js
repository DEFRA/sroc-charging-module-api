'use strict'

class BaseTransactionsController {
  static async index (_req, _h) {
    return 'hello, base transactions'
  }
}

module.exports = BaseTransactionsController
