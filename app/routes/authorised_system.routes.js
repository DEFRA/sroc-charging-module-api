import AuthorisedSystemsController from '../controllers/admin/authorised_systems.controller.js'

const AuthorisedSystemRoutes = [
  {
    method: 'GET',
    path: '/admin/authorised-systems',
    handler: AuthorisedSystemsController.index,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/admin/authorised-systems/{id}',
    handler: AuthorisedSystemsController.show,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'POST',
    path: '/admin/authorised-systems',
    handler: AuthorisedSystemsController.create,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'PATCH',
    path: '/admin/authorised-systems/{id}',
    handler: AuthorisedSystemsController.update,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

export default AuthorisedSystemRoutes
