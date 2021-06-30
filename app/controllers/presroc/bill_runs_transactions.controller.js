import CreateTransactionBillRunValidationService from '../../services/create_transaction_bill_run_validation.service.js'
import CreateTransactionService from '../../services/create_transaction.service.js'

export default class BillRunsTransactionsController {
  static async create (req, h) {
    await CreateTransactionBillRunValidationService.go(req.app.billRun, req.payload.region)

    const result = await CreateTransactionService.go(req.payload, req.app.billRun, req.auth.credentials.user, req.app.regime)

    return h.response(result).code(201)
  }

  static async view (req, h) {
    const result = {
      transaction: {
        id: req.params.transactionId
      }
    }

    return h.response(result).code(200)
  }
}
