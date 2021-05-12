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
  },
  {
    method: 'GET',
    path: '/admin/authorised-systems/{id}',
    handler: AuthorisedSystemsController.show,
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
