const {
  NotSupportedController,
  PresrocCustomerDetailsController
} = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/customer-changes',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/customer-changes',
    handler: PresrocCustomerDetailsController.create
  }
]

module.exports = routes
