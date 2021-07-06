import DatabaseController from '../controllers/admin/health/database.controller.js'

const DatabaseRoutes = [
  {
    method: 'GET',
    path: '/admin/health/database',
    handler: DatabaseController.index,
    options: {
      description: 'Used by the delivery team to confirm we can connect to the database. It also returns us some ' +
        'useful stats about each table.',
      auth: {
        scope: ['admin']
      }
    }
  }
]

export default DatabaseRoutes
