const { NotSupportedController, PresrocCalculateChargeController } = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/calculate-charge',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/calculate-charge',
    handler: PresrocCalculateChargeController.calculate
  }
]

module.exports = routes
