'use strict'

const {
  NotSupportedController,
  BillRunsTransactionsController
} = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/billruns/{billRunId}/transactions',
    handler: NotSupportedController.index
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/transactions',
    handler: BillRunsTransactionsController.create
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/transactions/{transactionId}',
    handler: BillRunsTransactionsController.view
  }
]

module.exports = routes
