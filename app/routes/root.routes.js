import RootController from '../controllers/root.controller.js'

const RootRoutes = [
  {
    method: 'GET',
    path: '/',
    handler: RootController.index,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/status',
    handler: RootController.index,
    options: {
      auth: false
    }
  }
]

export default RootRoutes
