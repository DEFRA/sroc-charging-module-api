'use strict'

const AdminBillRunsController = require('../controllers/admin/bill_runs.controller.js')
const BillRunsController = require('../controllers/bill_runs.controller.js')
const NotSupportedController = require('../controllers/not_supported.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeSlug}/billruns',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeSlug}/bill-runs',
    handler: BillRunsController.createV2,
    options: {
      app: {
        deprecation: {
          successor: '/v3/{regimeSlug}/bill-runs'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/v3/{regimeSlug}/bill-runs',
    handler: BillRunsController.create
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/generate',
    handler: BillRunsController.generate
  },
  {
    method: 'PATCH',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}/generate',
    handler: BillRunsController.generate
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/approve',
    handler: BillRunsController.approve
  },
  {
    method: 'PATCH',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}/approve',
    handler: BillRunsController.approve
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/send',
    handler: BillRunsController.send
  },
  {
    method: 'PATCH',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}/send',
    handler: BillRunsController.send
  },
  {
    method: 'GET',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/status',
    handler: BillRunsController.status
  },
  {
    method: 'GET',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}/status',
    handler: BillRunsController.status
  },
  {
    method: 'GET',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}',
    handler: BillRunsController.view
  },
  {
    method: 'GET',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}',
    handler: BillRunsController.view
  },
  {
    method: 'DELETE',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}',
    handler: BillRunsController.delete
  },
  {
    method: 'DELETE',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}',
    handler: BillRunsController.delete
  },
  {
    method: 'PATCH',
    path: '/admin/{regimeSlug}/bill-runs/{billRunId}/send',
    handler: AdminBillRunsController.send,
    options: {
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
