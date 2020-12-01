'use strict'

const { PresrocCalculateChargeController, SrocCalculateChargeController } = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/calculate-charge',
    handler: PresrocCalculateChargeController.calculate
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/calculate-charge',
    handler: SrocCalculateChargeController.calculate
  }
]

module.exports = routes
