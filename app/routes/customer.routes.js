'use strict'

const CustomersController = require('../controllers/admin/customers.controller.js')

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
