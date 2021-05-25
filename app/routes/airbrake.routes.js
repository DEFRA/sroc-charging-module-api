'use strict'

const { AirbrakeController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/admin/health/airbrake',
    handler: AirbrakeController.index
  }
]

module.exports = routes
