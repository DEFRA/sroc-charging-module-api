'use strict'

const AuthorisedSystemsController = require('../controllers/admin/authorised_systems.controller')

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
  },
  {
    method: 'GET',
    path: '/admin/authorised-systems/{id}',
    handler: AuthorisedSystemsController.view,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'POST',
    path: '/admin/authorised-systems',
    handler: AuthorisedSystemsController.create,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'PATCH',
    path: '/admin/authorised-systems/{id}',
    handler: AuthorisedSystemsController.update,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
