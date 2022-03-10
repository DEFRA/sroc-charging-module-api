'use strict'

/**
 * @module CalculateChargeService
 */

const Boom = require('@hapi/boom')

const CalculateChargePresrocTranslator = require('../../translators/calculate_charge_presroc.translator')
const CalculateChargeSrocTranslator = require('../../translators/calculate_charge_sroc.translator')
const RulesServicePresrocTranslator = require('../../translators/rules_service_presroc.translator')
const RulesServiceSrocTranslator = require('../../translators/rules_service_sroc.translator')

const CalculateChargePresrocPresenter = require('../../presenters/calculate_charge_presroc.presenter')
const CalculateChargeSrocPresenter = require('../../presenters/calculate_charge_sroc.presenter')
const RulesServicePresrocPresenter = require('../../presenters/rules_service_presroc.presenter')
const RulesServiceSrocPresenter = require('../../presenters/rules_service_sroc.presenter')

const RequestRulesServiceChargeService = require('./request_rules_service_charge.service')

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
   * @param {boolean} [presenterResponse] Whether to return the result ready for responding to a client (the default) or
   * to return the rules service result directly
   *
   * @returns {Object} The calculated charge, either formatted ready for responding to the client or as translated from
   * the rules service response
   */
  static async go (payload, regime, presenterResponse = true) {
    const {
      calculateChargeTranslator,
      rulesServicePresenter,
      rulesServiceTranslator,
      calculateChargePresenter
    } = this._determineConvertors(payload.ruleset)

    const translator = this._translateRequest(payload, regime, calculateChargeTranslator)
    const calculatedCharge = await this._calculateCharge(translator, rulesServicePresenter, rulesServiceTranslator)

    // We merge the translator and the rules service result and in preparation for generating the response.
    this._applyCalculatedCharge(translator, calculatedCharge)

    return this._response(translator, presenterResponse, calculateChargePresenter)
  }

  /**
   * Takes the request ruleset and returns the appropriate translators and presenters. Throws a `Boom.badData()` error
   * if the ruleset is invalid.
   */
  static _determineConvertors (ruleset) {
    switch (ruleset) {
      case 'presroc':
        return {
          calculateChargeTranslator: CalculateChargePresrocTranslator,
          rulesServicePresenter: RulesServicePresrocPresenter,
          rulesServiceTranslator: RulesServicePresrocTranslator,
          calculateChargePresenter: CalculateChargePresrocPresenter
        }
      case 'sroc':
        return {
          calculateChargeTranslator: CalculateChargeSrocTranslator,
          rulesServicePresenter: RulesServiceSrocPresenter,
          rulesServiceTranslator: RulesServiceSrocTranslator,
          calculateChargePresenter: CalculateChargeSrocPresenter
        }
      default:
        throw Boom.badData('Invalid ruleset')
    }
  }

  static _translateRequest (payload, regime, ChargeTranslator) {
    return new ChargeTranslator({
      ...payload,
      regime: regime.slug
    })
  }

  static async _calculateCharge (translator, RulesServicePresenter, RulesServiceTranslator) {
    const presenter = new RulesServicePresenter(translator)
    const result = await RequestRulesServiceChargeService.go(presenter.go())

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

  /**
   * Determine and generate the response needed from the service.
   *
   * We have to cater for 2 scenarios
   *
   * - A call to the create transaction endpoint
   * - A call to the calculate charge endpoint
   *
   * The second of those is the simplest. The client system is expected to give us just the information needed for the
   * rules service to be able to calculate the charge, and we are expected to just respond with the result. For this
   * reason we pass the values generated and validated by this service to `CalculateChargePresenter`, which then returns
   * a simple JSON object.
   *
   * If it's the transaction endpoint, we need all the values plus we need to retain the translated names so they match
   * our system and database. In this case we just return charge as is.
   *
   * @param {Object} charge A JSON object that represents the combination of `CalculateChargeTranslator` and
   * `RulesServiceTranslator`
   * @param {boolean} presenterResponse If `true` the `charge` will be passed to `CalculateChargePresenter` to generate
   * the response. Else `charge` itself will be returned.
   *
   * @returns {Object} Either the combined result of `CalculateChargeTranslator` and the result from the rules service,
   * or a response parsed and formatted by `CalculateChargePresenter` and intended as the response for the calculate
   * charge endpoint.
   */
  static _response (charge, presenterResponse, CalculateChargePresenter) {
    if (presenterResponse) {
      return new CalculateChargePresenter(charge).go()
    }

    return charge
  }
}

module.exports = CalculateChargeService
