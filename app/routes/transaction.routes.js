const { NotSupportedController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/v1/{regimeId}/transactions',
    handler: NotSupportedController.index
  },
  {
    method: 'GET',
    path: '/v1/{regimeId}/transactions/{transactionId}',
    handler: NotSupportedController.index
  }
]

module.exports = routes
