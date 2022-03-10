'use strict'

const NotSupportedController = require('../controllers/not_supported.controller')

const routes = [
  {
    method: 'GET',
    path: '/v1/{regimeSlug}/transactions',
    handler: NotSupportedController.index
  },
  {
    method: 'GET',
    path: '/v1/{regimeSlug}/transactions/{transactionId}',
    handler: NotSupportedController.index
  }
]

module.exports = routes
