'use strict'

/**
 * @module CreateTransactionV2GuardService
 */

const Boom = require('@hapi/boom')

class CreateTransactionV2GuardService {
  /**
   * Guard service which checks a Create Transaction v2 request to ensure that the bill run the request is for is
   * presroc. If not then it throws an error.
   *
   * @param {module:BillRunModel} billRun The bill run to be checked.
   */
  static async go (billRun) {
    if (billRun.ruleset !== 'presroc') {
      throw Boom.badData('Create Transaction v2 request must be for a presroc bill run')
    }
  }
}

module.exports = CreateTransactionV2GuardService
