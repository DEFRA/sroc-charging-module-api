'use strict'

/**
 * This service handles the presentation of a calculate charge request to the rules
 * service, and the translation of the response.
 */

/**
 * Our standard is to destructure services etc. from the index, eg:
 *   const { RulesService } = require('../services')
 *
 * However this cannot be done here, see https://stackoverflow.com/a/42365619 for info
 */
const RulesService = require('./rules.service')

class CalculateChargeService {
  /**
   * Presents a calculate charge request to the rules service and translates the response.
   * @param {object} presenter A presenter containing the request to be sent to the rules service
   * @param {object} Translator A translator which will contain the response from the rules service
   * @returns {object} An instance of Translator containing the response from the rules service
   */
  static async call (presenter, Translator) {
    const response = await RulesService.call(presenter)
    return new Translator(response.body)
  }
}

module.exports = CalculateChargeService
