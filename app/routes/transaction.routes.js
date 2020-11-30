'use strict'

const { NotSupportedController, PresrocTransactionsController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/v1/transactions',
    handler: NotSupportedController.index
  },
  {
    method: 'GET',
    path: '/v2/transactions',
    handler: PresrocTransactionsController.index
  }
]

module.exports = routes
