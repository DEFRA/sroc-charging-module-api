'use strict'

const CalculateChargeService = require('../services/charges/calculate_charge.service.js')
const CalculateChargeV2GuardService = require('../services/guards/calculate_charge_v2_guard.service.js')

class CalculateChargeController {
  static async calculateV2 (req, h) {
    // Validate the v2 request and set v2 default
    await CalculateChargeV2GuardService.go(req.payload)
    req.payload.ruleset = 'presroc'

    const result = await CalculateChargeService.go(req.payload, req.app.regime)

    return h.response(result).code(200)
  }

  static async calculate (req, h) {
    const result = await CalculateChargeService.go(req.payload, req.app.regime)

    return h.response(result).code(200)
  }
}

module.exports = CalculateChargeController
