'use strict'

const BillRunsTransactionsController = require('../controllers/bill_runs_transactions.controller')
const NotSupportedController = require('../controllers/not_supported.controller')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeSlug}/billruns/{billRunId}/transactions',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/transactions',
    handler: BillRunsTransactionsController.createV2
  },
  {
    method: 'POST',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}/transactions',
    handler: BillRunsTransactionsController.create
  }
]

module.exports = routes
