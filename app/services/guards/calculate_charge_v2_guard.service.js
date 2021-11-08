'use strict'

/**
 * @module CalculateChargeV2GuardService
 */

const Boom = require('@hapi/boom')

class CalculateChargeV2GuardService {
  /**
   * Guard service which checks a Calculate Charge v2 request to ensure that the payload does not contain `ruleset`. If
   * present it throws an error.
   *
   * @param {object} payload The request payload to be checked.
   */
  static async go (payload) {
    if ('ruleset' in payload) {
      throw Boom.badData('Calculate Charge v2 request cannot contain ruleset parameter')
    }
  }
}

module.exports = CalculateChargeV2GuardService
