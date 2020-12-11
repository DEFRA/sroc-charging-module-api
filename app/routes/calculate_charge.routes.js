'use strict'

const { PresrocCalculateChargeController } = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/calculate-charge',
    handler: PresrocCalculateChargeController.calculate
  }
]

module.exports = routes
