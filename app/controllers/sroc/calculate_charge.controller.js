'use strict'

const BaseCalculateChargeController = require('../base_calculate_charge.controller')

const { ChargeModel } = require('../../models')
const { CalculateChargeService } = require('../../services')
const { ChargeTranslator, RulesServiceTranslator } = require('../../translators')
const { ChargePresenter, RulesServicePresenter } = require('../../presenters')

class CalculateChargeController extends BaseCalculateChargeController {
  static async calculate (req, _h) {
    const charge = CalculateChargeController._createCharge(req.payload)
    const rulesServiceResponse = await CalculateChargeController._presentRequest(charge, req.params.regime)
    Object.assign(charge, rulesServiceResponse)
    return CalculateChargeController._presentResponse(charge)
  }

  static _createCharge (payload) {
    const translatedRequest = new ChargeTranslator(payload)
    return new ChargeModel(translatedRequest)
  }

  static _presentRequest (charge, regime) {
    const requestPresenter = new RulesServicePresenter({ ...charge, regime })
    return CalculateChargeService.call(requestPresenter.call(), RulesServiceTranslator)
  }

  static _presentResponse (charge) {
    const responsePresenter = new ChargePresenter(charge)
    return responsePresenter.call()
  }
}

module.exports = CalculateChargeController
