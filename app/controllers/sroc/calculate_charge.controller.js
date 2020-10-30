'use strict'

const BaseCalculateChargeController = require('../base_calculate_charge.controller')

const { ChargeModel } = require('../../models')
const { CalculateChargeService } = require('../../services')
const { ChargeTranslator, RulesServiceTranslator } = require('../../translators')
const { ChargePresenter, RulesServicePresenter } = require('../../presenters')

class CalculateChargeController extends BaseCalculateChargeController {
  static async calculate (req, _h) {
    const { regime } = req.params
    const translatedRequest = new ChargeTranslator(req.payload)
    const charge = new ChargeModel(translatedRequest)
    const requestPresenter = new RulesServicePresenter({ ...charge, regime })
    const rulesServiceResponse = await CalculateChargeService.call(requestPresenter.call(), RulesServiceTranslator)

    Object.assign(charge, rulesServiceResponse)
    const responsePresenter = new ChargePresenter(charge)
    return responsePresenter.call()
  }

  _sendRequest (req) {

  }
}

module.exports = CalculateChargeController
