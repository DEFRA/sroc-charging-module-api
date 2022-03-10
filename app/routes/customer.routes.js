'use strict'

const CustomersController = require('../controllers/admin/customers.controller')

const routes = [
  {
    method: 'PATCH',
    path: '/admin/{regimeSlug}/customers',
    handler: CustomersController.send,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
