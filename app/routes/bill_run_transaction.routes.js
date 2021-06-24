const {
  NotSupportedController,
  PresrocBillRunsTransactionsController
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
    handler: PresrocBillRunsTransactionsController.create
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/transactions/{transactionId}',
    handler: PresrocBillRunsTransactionsController.view
  }
]

module.exports = routes
