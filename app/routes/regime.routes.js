const { RegimesController } = require('../controllers')

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
    handler: RegimesController.show,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
