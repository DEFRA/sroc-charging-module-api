const AirbrakeController = require('../controllers/airbrake.controller')

const routes = [
  {
    method: 'GET',
    path: '/airbrake/auto',
    handler: AirbrakeController.auto
  },
  {
    method: 'GET',
    path: '/airbrake/manual',
    handler: AirbrakeController.manual
  }
]

module.exports = routes
