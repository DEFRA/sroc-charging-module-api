const regimes = require('../controllers/regimes.controller')

const routes = [
  {
    method: 'GET',
    path: '/regimes',
    handler: regimes.index,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/regimes/{id}',
    handler: regimes.show,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
