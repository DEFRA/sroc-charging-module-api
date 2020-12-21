'use strict'

/**
 * @module CreateTransactionService
 */

const { TransactionTranslator } = require('../translators')
const CalculateChargeService = require('./calculate_charge.service')

class CreateTransactionService {
  static async go (payload, billRunId, authorisedSystem, regime) {
    const translator = new TransactionTranslator(payload)
    const calculatedCharge = await this._calculateCharge(translator, regime)

    return 'not done yet'
  }

  static _calculateCharge (translator, regime) {
    // The CalculateChargeService expects data to be presented using the original request properties, for example,
    // `waterUndertaker` not `regimeValue14`. `validatedData` on the translator gives us access to the data in this
    // original format which is why we pass it in. The underlying data itself though remains the same though!
    return CalculateChargeService.go(translator.validatedData, regime)
  }
}

module.exports = CreateTransactionService
