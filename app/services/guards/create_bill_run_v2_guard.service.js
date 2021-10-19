'use strict'

/**
 * @module CreateBillRunV2GuardService
 */

const Boom = require('@hapi/boom')

class CreateBillRunV2GuardService {
  /**
   * Guard service which checks a Create Bill Run v2 request to ensure that the payload does not contain `ruleset`. If
   * present it throws an error.
   *
   * @param {object} payload The request payload to be checked.
   */
  static async go (payload) {
    if ('ruleset' in payload) {
      throw Boom.badData('Create Bill Run v2 request cannot contain ruleset parameter')
    }
  }
}

module.exports = CreateBillRunV2GuardService
