'use strict'

const {
  AdminBillRunsController,
  NotSupportedController,
  BillRunsController
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
    handler: BillRunsController.create
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/generate',
    handler: BillRunsController.generate
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/approve',
    handler: BillRunsController.approve
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/send',
    handler: BillRunsController.send
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/status',
    handler: BillRunsController.status
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}',
    handler: BillRunsController.view
  },
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}',
    handler: BillRunsController.delete
  },
  {
    method: 'PATCH',
    path: '/admin/{regimeId}/bill-runs/{billRunId}/send',
    handler: AdminBillRunsController.send,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
