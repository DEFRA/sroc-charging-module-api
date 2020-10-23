'use strict'

const PresrocTransactionController = require('../controllers/presroc/transactions.controller')
const SrocTransactionController = require('../controllers/sroc/transactions.controller')

const routes = [
  {
    method: 'GET',
    path: '/v1/transactions',
    handler: PresrocTransactionController.index
  },
  {
    method: 'GET',
    path: '/v2/transactions',
    handler: SrocTransactionController.index
  }
]

module.exports = routes
