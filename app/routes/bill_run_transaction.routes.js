import NotSupportedController from '../controllers/not_supported.controller.js'
import BillRunsTransactionsController from '../controllers/presroc/bill_runs_transactions.controller.js'

const BillRunTransactionRoutes = [
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

export default BillRunTransactionRoutes
