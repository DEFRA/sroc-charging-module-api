'use strict'

const { NotSupportedController, PresrocTransactionsController } = require('../controllers')

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
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/transactions',
    handler: PresrocTransactionsController.index
  }
]

module.exports = routes
