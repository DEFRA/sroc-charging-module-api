'use strict'

/**
 * @module CalculateChargeService
 */

const { CalculateChargeTranslator, RulesServiceTranslator } = require('../translators')
const { CalculateChargePresenter, RulesServicePresenter } = require('../presenters')

const RulesService = require('./rules.service')

class CalculateChargeService {
  static async go (payload, regime) {
    const translator = new CalculateChargeTranslator(payload)
    const calculatedCharge = await this._calculateCharge(translator, regime.slug)

    this._applyCalculatedCharge(translator, calculatedCharge)

    return this._response(translator)
  }

  static async _calculateCharge (translator, regimeSlug) {
    const presenter = new RulesServicePresenter({ ...translator, regime: regimeSlug })
    const result = await RulesService.go(presenter.go())

    return new RulesServiceTranslator(result)
  }

  static _applyCalculatedCharge (translator, calculatedCharge) {
    Object.assign(translator, calculatedCharge)
  }

  static _response (charge) {
    const presenter = new CalculateChargePresenter(charge)

    return presenter.go()
  }
}

module.exports = CalculateChargeService
