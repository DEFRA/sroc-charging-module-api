'use strict'

const { NotSupportedController, CalculateChargeController } = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/calculate-charge',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/calculate-charge',
    handler: CalculateChargeController.calculate
  }
]

module.exports = routes
