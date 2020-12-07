'use strict'

/**
 * @module CreateBillRunTransactionService
 */

const { TransactionModel } = require('../models')
const { TransactionTranslator, PreRulesServiceTranslator } = require('../translators')
const RulesService = require('./rules.service')
const { JsonPresenter, PresrocRulesServicePresenter } = require('../presenters')

class CreateBillRunTransactionService {
  static async go (payload, billRunId, authorisedSystem, regime) {
    const translator = new TransactionTranslator(payload)
    const calculatedCharge = await this._calculateCharge(translator, regime.slug)

    const transaction = await this._create(billRunId, authorisedSystem, regime, translator, calculatedCharge)

    return this._response(transaction)
  }

  static async _calculateCharge (translator, regimeSlug) {
    console.log(`TRANS TRANS ${JSON.stringify(translator)}`)
    const rulesPresenter = new PresrocRulesServicePresenter({ ...translator, regime: regimeSlug })
    const response = await RulesService.go(rulesPresenter.go())
    const rulesTranslator = new PreRulesServiceTranslator(response.body)

    return rulesTranslator
  }

  static _create (billRunId, authorisedSystem, regime, translator, calculatedCharge) {
    return TransactionModel.query()
      .insert({
        billRunId: billRunId,
        createdBy: authorisedSystem.id,
        regimeId: regime.id,
        ruleset: translator.ruleset,
        region: translator.region,
        customerReference: translator.customerReference,
        periodStart: translator.periodStart,
        periodEnd: translator.periodEnd,
        financialYear: translator.financialYear,
        newLicence: translator.newLicence,
        clientId: translator.clientId,
        chargeValue: calculatedCharge.chargeValue,
        credit: translator.credit,
        lineAreaCode: translator.lineAreaCode,
        lineDescription: translator.lineDescription,
        lineAttr1: translator.lineAttr1,
        lineAttr2: translator.lineAttr2,
        lineAttr3: translator.lineAttr3,
        lineAttr4: calculatedCharge.lineAttr4,
        lineAttr5: translator.lineAttr5,
        lineAttr6: calculatedCharge.lineAttr6,
        lineAttr7: calculatedCharge.lineAttr7,
        lineAttr8: calculatedCharge.lineAttr8,
        lineAttr9: calculatedCharge.lineAttr9,
        lineAttr10: calculatedCharge.lineAttr10,
        lineAttr13: calculatedCharge.lineAttr13,
        lineAttr14: calculatedCharge.lineAttr14,
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
        calculation: calculatedCharge.calculation
      })
      .returning('*')
  }

  static _response (transaction) {
    const presenter = new JsonPresenter(transaction)

    return presenter.go()
  }
}

module.exports = CreateBillRunTransactionService
