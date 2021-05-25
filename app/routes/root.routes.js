'use strict'

const { RootController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: RootController.index
  },
  {
    method: 'GET',
    path: '/status',
    handler: RootController.index
  }
]

module.exports = routes
