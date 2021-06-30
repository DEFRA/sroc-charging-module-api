import RegimesController from '../controllers/admin/regimes.controller.js'

const RegimeRoutes = [
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

export default RegimeRoutes
