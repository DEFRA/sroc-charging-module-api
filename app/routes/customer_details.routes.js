'use strict'

const NotSupportedController = require('../controllers/not_supported.controller.js')
const CustomerDetailsController = require('../controllers/customer_details.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeSlug}/customer-changes',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeSlug}/customer-changes',
    handler: CustomerDetailsController.create
  },
  {
    method: 'POST',
    path: '/v3/{regimeSlug}/customer-changes',
    handler: CustomerDetailsController.create
  }
]

module.exports = routes
