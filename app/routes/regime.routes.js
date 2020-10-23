'use strict'

const { RegimesController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/regimes',
    handler: RegimesController.index,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/regimes/{id}',
    handler: RegimesController.show,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
