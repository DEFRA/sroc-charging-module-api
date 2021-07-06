import ShowTransactionService from '../../../services/show_transaction.service.js'

export default class TestTransactionsController {
  static async show (req, h) {
    const result = await ShowTransactionService.go(req.params.id)

    return h.response(result).code(200)
  }
}
