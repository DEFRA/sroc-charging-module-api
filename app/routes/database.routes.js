'use strict'

const { DatabaseController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/admin/health/database',
    handler: DatabaseController.index
  }
]

module.exports = routes
