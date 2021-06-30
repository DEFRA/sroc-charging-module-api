import NotSupportedController from '../controllers/not_supported.controller.js'

const TransactionRoutes = [
  {
    method: 'GET',
    path: '/v1/{regimeId}/transactions',
    handler: NotSupportedController.index
  },
  {
    method: 'GET',
    path: '/v1/{regimeId}/transactions/{transactionId}',
    handler: NotSupportedController.index
  }
]

export default TransactionRoutes
