const AirbrakeController = require('../controllers/airbrake.controller')

const routes = [
  {
    method: 'GET',
    path: '/airbrake/auto',
    handler: AirbrakeController.auto,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/airbrake/manual',
    handler: AirbrakeController.manual,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
