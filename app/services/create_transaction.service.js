'use strict'

/**
 * @module CreateTransactionService
 */

const { TransactionModel } = require('../models')
const { TransactionTranslator } = require('../translators')
const CalculateChargeService = require('./calculate_charge.service')

class CreateTransactionService {
  static async go (payload, billRunId, authorisedSystem, regime) {
    const translator = new TransactionTranslator(payload)
    const calculatedCharge = await this._calculateCharge(translator, regime)

    this._applyCalculatedCharge(translator, calculatedCharge)

    const transaction = await this._create(billRunId, authorisedSystem, regime, translator)

    return JSON.stringify(transaction)
  }

  static _calculateCharge (translator, regime) {
    // The CalculateChargeService expects data to be presented using the original request properties, for example,
    // `waterUndertaker` not `regimeValue14`. `validatedData` on the translator gives us access to the data in this
    // original format which is why we pass it in. The underlying data itself though remains the same!
    return CalculateChargeService.go(translator.validatedData, regime)
  }

  /**
   * Assign properties of the calculated charge to the translator object
   *
   * The translator represents our transaction until we persist it. A transaction encompasses properties we get from the
   * client making the request and the results we get back from the charge service. This is why we assign the calculated
   * charge to the translator. It gives us a complete representation of the transaction ready for persisting to the
   * database.
   */
  static _applyCalculatedCharge (translator, calculatedCharge) {
    Object.assign(translator, calculatedCharge.calculation)
  }

  static _create (billRunId, authorisedSystem, regime, translator) {
    return TransactionModel.transaction(async trx => {
      const transaction = await TransactionModel.query(trx)
        .insert({
          billRunId: billRunId,
          createdBy: authorisedSystem.id,
          regimeId: regime.id,
          ruleset: translator.ruleset,
          region: translator.region,
          customerReference: translator.customerReference,
          chargePeriodStart: translator.chargePeriodStart,
          chargePeriodEnd: translator.chargePeriodEnd,
          chargeFinancialYear: translator.chargeFinancialYear,
          newLicence: translator.newLicence,
          clientId: translator.clientId,
          chargeValue: translator.chargeValue,
          chargeCredit: translator.chargeCredit,
          lineAreaCode: translator.lineAreaCode,
          lineDescription: translator.lineDescription,
          lineAttr1: translator.lineAttr1,
          lineAttr2: translator.lineAttr2,
          lineAttr3: translator.lineAttr3,
          lineAttr4: translator.lineAttr4,
          lineAttr5: translator.lineAttr5,
          lineAttr6: translator.lineAttr6,
          lineAttr7: translator.lineAttr7,
          lineAttr8: translator.lineAttr8,
          lineAttr9: translator.lineAttr9,
          lineAttr10: translator.lineAttr10,
          lineAttr13: translator.lineAttr13,
          lineAttr14: translator.lineAttr14,
          regimeValue1: translator.regimeValue1,
          regimeValue3: translator.regimeValue3,
          regimeValue4: translator.regimeValue4,
          regimeValue5: translator.regimeValue5,
          regimeValue6: translator.regimeValue6,
          regimeValue7: translator.regimeValue7,
          regimeValue8: translator.regimeValue8,
          regimeValue9: translator.regimeValue9,
          regimeValue10: translator.regimeValue10,
          regimeValue11: translator.regimeValue11,
          regimeValue12: translator.regimeValue12,
          regimeValue13: translator.regimeValue13,
          regimeValue14: translator.regimeValue14,
          regimeValue15: translator.regimeValue15,
          regimeValue16: translator.regimeValue16,
          regimeValue17: translator.regimeValue17,
          chargeCalculation: translator.chargeCalculation
        })
        .returning('*')

      return transaction
    })
  }
}

module.exports = CreateTransactionService
