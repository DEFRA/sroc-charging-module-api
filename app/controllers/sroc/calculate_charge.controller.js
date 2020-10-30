'use strict'

const BaseCalculateChargeController = require('../base_calculate_charge.controller')

const { ChargeModel } = require('../../models')
const { CalculateChargeService } = require('../../services')
const { ChargeTranslator, RulesServiceTranslator } = require('../../translators')
const { ChargePresenter, RulesServicePresenter } = require('../../presenters')

class CalculateChargeController extends BaseCalculateChargeController {
  static async calculate (req, _h) {
    const charge = _createCharge(req.payload)
    const rulesServiceResponse = await _presentRequest(charge, req.params.regime)
    Object.assign(charge, rulesServiceResponse)
    return _presentResponse(charge)
  }
}

function _createCharge (payload) {
  const translatedRequest = new ChargeTranslator(payload)
  return new ChargeModel(translatedRequest)
}

async function _presentRequest (charge, regime) {
  const requestPresenter = new RulesServicePresenter({ ...charge, regime })
  return CalculateChargeService.call(requestPresenter.call(), RulesServiceTranslator)
}

function _presentResponse (charge) {
  const responsePresenter = new ChargePresenter(charge)
  return responsePresenter.call()
}

module.exports = CalculateChargeController
