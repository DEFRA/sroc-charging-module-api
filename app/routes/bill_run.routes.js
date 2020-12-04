'use strict'

const {
  NotSupportedController,
  PresrocAddBillRunTransactionController,
  PresrocBillRunsController
} = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/billruns',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/bill-runs',
    handler: PresrocBillRunsController.create
  },
  {
    method: 'POST',
    path: '/v1/{regimeId}/billruns/{billRunId}/transactions',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/transactions',
    handler: PresrocAddBillRunTransactionController.create
  }
]

module.exports = routes
