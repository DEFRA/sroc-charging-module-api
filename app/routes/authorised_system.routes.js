'use strict'

const { AuthorisedSystemsController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/admin/authorised-systems',
    handler: AuthorisedSystemsController.index,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
