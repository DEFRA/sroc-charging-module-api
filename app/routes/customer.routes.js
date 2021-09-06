'use strict'

const { CustomersController } = require('../controllers')

const routes = [
  {
    method: 'PATCH',
    path: '/admin/{regimeId}/customers',
    handler: CustomersController.send,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
