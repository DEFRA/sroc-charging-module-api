'use strict'

/**
 * @module CreateTransactionService
 */

const { TransactionTranslator } = require('../translators')

class CreateTransactionService {
  static async go (payload, billRunId, authorisedSystem, regime) {
    const translator = new TransactionTranslator(payload)

    return 'not done yet'
  }
}

module.exports = CreateTransactionService
