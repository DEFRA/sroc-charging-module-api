'use strict'

/**
 * @module ValidateChargeService
 */

const Boom = require('@hapi/boom')

const { CalculateChargePresrocTranslator, CalculateChargeSrocTranslator } = require('../../translators')
const { JsonPresenter } = require('../../presenters')

class ValidateChargeService {
  /**
   * Simple service to validate incoming calculate charge requests. Intended solely for use in testing sroc validation:
   *
   * https://eaflood.atlassian.net/jira/software/projects/CMEA/boards/907?selectedIssue=CMEA-194
   *
   * @param {Object} payload The payload from the API request. payload.ruleset should be either `sroc` or `presroc`; a
   *  Boom.badData error will be thrown if it isn't.
   * @param {module:RegimeModel} regime Instance of `RegimeModel`, whose slug will be passed to the translator
   *
   * @returns {Object} The validated data.
   */
  static async go (payload, regime) {
    let TranslatorToUse

    switch (payload.ruleset) {
      case 'sroc':
        TranslatorToUse = CalculateChargeSrocTranslator
        break
      case 'presroc':
        TranslatorToUse = CalculateChargePresrocTranslator
        break
      default:
        throw Boom.badData('Invalid ruleset')
    }

    const validated = this._translateRequest(TranslatorToUse, payload, regime)

    return this._response(validated)
  }

  static _translateRequest (TranslatorToUse, payload, regime) {
    return new TranslatorToUse({
      ...payload,
      regime: regime.slug
    })
  }

  static _response (validated) {
    return new JsonPresenter(validated).go()
  }
}

module.exports = ValidateChargeService
