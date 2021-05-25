'use strict'

const { AuthorisedSystemsController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/admin/authorised-systems',
    handler: AuthorisedSystemsController.index
  },
  {
    method: 'GET',
    path: '/admin/authorised-systems/{id}',
    handler: AuthorisedSystemsController.show
  },
  {
    method: 'POST',
    path: '/admin/authorised-systems',
    handler: AuthorisedSystemsController.create
  },
  {
    method: 'PATCH',
    path: '/admin/authorised-systems/{id}',
    handler: AuthorisedSystemsController.update
  }
]

module.exports = routes
