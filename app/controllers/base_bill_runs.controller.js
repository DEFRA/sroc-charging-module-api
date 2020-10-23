'use strict'

class BaseBillRunsController {
  static async index (_req, _h) {
    return 'hello, base billruns'
  }
}

module.exports = BaseBillRunsController
