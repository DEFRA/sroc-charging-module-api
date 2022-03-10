'use strict'

const RegimesController = require('../controllers/admin/regimes.controller')

const routes = [
  {
    method: 'GET',
    path: '/admin/regimes',
    handler: RegimesController.index,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/admin/regimes/{id}',
    handler: RegimesController.view,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
