'use strict'

const { RegimesController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/admin/regimes',
    handler: RegimesController.index
  },
  {
    method: 'GET',
    path: '/admin/regimes/{id}',
    handler: RegimesController.show
  }
]

module.exports = routes
