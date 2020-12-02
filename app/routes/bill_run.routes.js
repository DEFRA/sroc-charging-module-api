'use strict'

const { NotSupportedController, PresrocBillRunsController } = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/billruns',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/billruns',
    handler: PresrocBillRunsController.create
  }
]

module.exports = routes
