'use strict'

const { CalculateChargeService } = require('../services')

class CalculateChargeController {
  static async calculate (req, h) {
    // Set v2 default
    req.payload.ruleset = 'presroc'

    const result = await CalculateChargeService.go(req.payload, req.app.regime)

    return h.response(result).code(200)
  }
}

module.exports = CalculateChargeController
