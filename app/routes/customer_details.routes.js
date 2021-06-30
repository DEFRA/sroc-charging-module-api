import CustomerDetailsController from '../controllers/presroc/customer_details.controller.js'
import NotSupportedController from '../controllers/not_supported.controller.js'

const CustomerDetailsRoutes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/customer-changes',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/customer-changes',
    handler: CustomerDetailsController.create
  }
]

export default CustomerDetailsRoutes
