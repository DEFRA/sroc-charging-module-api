'use strict'

const { ChargeModel } = require('../../models')
const { CalculateChargeService } = require('../../services')
const { SrocChargeTranslator, RulesServiceTranslator } = require('../../translators')
const { ChargePresenter, RulesServicePresenter } = require('../../presenters')

class CalculateChargeController {
  static async calculate (req, _h) {
    const charge = CalculateChargeController._createCharge(req.payload)
    const rulesServiceResponse = await CalculateChargeController._presentRequest(charge, req.app.regime.slug)
    Object.assign(charge, rulesServiceResponse)
    return CalculateChargeController._presentResponse(charge)
  }

  static _createCharge (payload) {
    const translatedRequest = new SrocChargeTranslator(payload)
    return new ChargeModel(translatedRequest)
  }

  static _presentRequest (charge, regime) {
    const requestPresenter = new RulesServicePresenter({ ...charge, regime })
    return CalculateChargeService.go(requestPresenter.go(), RulesServiceTranslator)
  }

  static _presentResponse (charge) {
    const responsePresenter = new ChargePresenter(charge)
    return responsePresenter.go()
  }
}

module.exports = CalculateChargeController
