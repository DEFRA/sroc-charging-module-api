'use strict'

/**
 * @module CalculateChargeService
 */

const { CalculateChargeTranslator, RulesServiceTranslator } = require('../translators')
const { CalculateChargePresenter, RulesServicePresenter } = require('../presenters')

const RulesService = require('./rules.service')

/**
 * Handles calling the rules service and returning a response when calculating a charge
 *
 * When a request comes in it needs to be translated, validated and then formatted for sending to the rules service. We
 * then take that response and format it into the response we send to the client.
 */
class CalculateChargeService {
  /**
   * Initiator method of the service. When called the service will take the inputs and return a calculated charge.
   *
   * @param {Object} payload The payload from the API request
   * @param {module:RegimeModel} regime Instance of `RegimeModel` representing the regime we are calculating the charge
   * for
   *
   * @returns {Object} The calculated charge
   */
  static async go (payload, regime) {
    const translator = this._translateRequest(payload, regime)
    const calculatedCharge = await this._calculateCharge(translator)

    this._applyCalculatedCharge(translator, calculatedCharge)

    return this._response(translator)
  }

  static _translateRequest (payload, regime) {
    return new CalculateChargeTranslator({
      ...payload,
      regime: regime.slug
    })
  }

  static async _calculateCharge (translator) {
    const presenter = new RulesServicePresenter(translator)
    const result = await RulesService.go(presenter.go())

    return new RulesServiceTranslator(result)
  }

  /**
   * Apply the calculated charge to our charge translator instance
   *
   * We consider the values we get back from the rules service a subset of the charge. As such we assign them to the
   * translator instance. This helps, for example, when it comes to presenting the data; we only have to deal with the
   * translator instance.
   *
   * @param {module:CalculateChargeTranslator} translator A populated and validated instance of
   *  `CalculateChargeTranslator`
   * @param {module:RulesServiceTranslator} calculatedCharge A populated and validated instance of
   *  `RulesServiceTranslator`
   */
  static _applyCalculatedCharge (translator, calculatedCharge) {
    Object.assign(translator, calculatedCharge)
  }

  static _response (charge) {
    const presenter = new CalculateChargePresenter(charge)

    return presenter.go()
  }
}

module.exports = CalculateChargeService
