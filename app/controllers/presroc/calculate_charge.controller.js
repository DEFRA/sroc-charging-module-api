'use strict'

const BaseCalculateChargeController = require('../base_calculate_charge.controller')

class CalculateChargeController extends BaseCalculateChargeController {
  static async calculate (req, _h) {
    return req
  }
}

module.exports = CalculateChargeController
