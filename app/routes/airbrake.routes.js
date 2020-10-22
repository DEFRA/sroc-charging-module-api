const AirbrakeController = require('../controllers/admin/health/airbrake.controller')

const routes = [
  {
    method: 'GET',
    path: '/admin/health/airbrake',
    handler: AirbrakeController.index,
    options: {
      description: 'Used by the delivery team to confirm error logging is working correctly in an environment. ' +
        'NOTE. We expect this endpoint to return a 500',
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
