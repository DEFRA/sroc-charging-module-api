'use strict'

const {
  NotSupportedController,
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
    handler: PresrocBillRunsController.createTransaction
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/generate',
    handler: PresrocBillRunsController.generate
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/status',
    handler: PresrocBillRunsController.status
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}',
    handler: PresrocBillRunsController.view
  }
]

module.exports = routes
