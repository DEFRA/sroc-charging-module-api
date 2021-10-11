'use strict'

const {
  NotSupportedController,
  CustomerDetailsController
} = require('../controllers')

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
  }
]

module.exports = routes
