'use strict'

const NotSupportedController = require('../controllers/not_supported.controller')
const CalculateChargeController = require('../controllers/calculate_charge.controller')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeSlug}/calculate-charge',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeSlug}/calculate-charge',
    handler: CalculateChargeController.calculateV2
  },
  {
    method: 'POST',
    path: '/v3/{regimeSlug}/calculate-charge',
    handler: CalculateChargeController.calculate
  }
]

module.exports = routes
