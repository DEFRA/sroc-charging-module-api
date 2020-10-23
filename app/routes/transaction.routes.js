'use strict'

const { PresrocTransactionsController, SrocTransactionsController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/v1/transactions',
    handler: PresrocTransactionsController.index
  },
  {
    method: 'GET',
    path: '/v2/transactions',
    handler: SrocTransactionsController.index
  }
]

module.exports = routes
