'use strict'

const RegimeController = require('../controllers/regimes.controller')

const routes = [
  {
    method: 'GET',
    path: '/regimes',
    handler: RegimeController.index,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/regimes/{id}',
    handler: RegimeController.show,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
