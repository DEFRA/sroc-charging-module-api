'use strict'

const {
  AdminBillRunsController,
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
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/generate',
    handler: PresrocBillRunsController.generate
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/approve',
    handler: PresrocBillRunsController.approve
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/send',
    handler: PresrocBillRunsController.send
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
  },
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}',
    handler: PresrocBillRunsController.delete
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
