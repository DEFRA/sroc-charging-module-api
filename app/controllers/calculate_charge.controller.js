'use strict'

const { CalculateChargeService, ValidateChargeService } = require('../services')

class CalculateChargeController {
  static async calculateV2 (req, h) {
    // Set v2 default
    req.payload.ruleset = 'presroc'

    const result = await CalculateChargeService.go(req.payload, req.app.regime)

    return h.response(result).code(200)
  }

  static async calculate (req, h) {
    const result = await ValidateChargeService.go(req.payload, req.app.regime)

    return h.response(result).code(200)
  }
}

module.exports = CalculateChargeController
