'use strict'

const { PresrocCalculateChargeController, SrocCalculateChargeController } = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regime}/calculate_charge',
    handler: PresrocCalculateChargeController.calculate
  },
  {
    method: 'POST',
    path: '/v2/{regime}/calculate_charge',
    handler: SrocCalculateChargeController.calculate
  }
]

module.exports = routes
