import CustomersController from '../controllers/admin/customers.controller.js'

const CustomerRoutes = [
  {
    method: 'PATCH',
    path: '/admin/{regimeId}/customers',
    handler: CustomersController.send,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/admin/{regimeId}/customers',
    handler: CustomersController.show,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

export default CustomerRoutes
