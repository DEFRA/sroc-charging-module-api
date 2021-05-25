'use strict'

const { CustomersController } = require('../controllers')

const routes = [
  {
    method: 'PATCH',
    path: '/admin/{regimeId}/customers',
    handler: CustomersController.send
  },
  {
    method: 'GET',
    path: '/admin/{regimeId}/customers',
    handler: CustomersController.show
  }
]

module.exports = routes
