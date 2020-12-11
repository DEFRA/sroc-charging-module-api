'use strict'

/**
 * @module CreateBillRunTransactionService
 */

const { InvoiceModel, TransactionModel } = require('../models')
const { TransactionTranslator, PreRulesServiceTranslator } = require('../translators')
const RulesService = require('./rules.service')
const InvoiceService = require('./invoice.service')
const { JsonPresenter, PresrocRulesServicePresenter } = require('../presenters')
const Boom = require('@hapi/boom')

class CreateBillRunTransactionService {
  static async go (payload, billRunId, authorisedSystem, regime) {
    const translator = new TransactionTranslator(payload)
    const calculatedCharge = await this._calculateCharge(translator, regime.slug)

    this._applyCalculatedCharge(translator, calculatedCharge)
    const invoice = await this._invoice(billRunId, translator)
    console.log(`INVOICE ${invoice instanceof InvoiceModel}`)
    console.log(`INVOICE ${invoice.id} ${invoice.debitCount}`)

    const transaction = await this._create(billRunId, authorisedSystem, regime, translator, invoice)
    return this._response(transaction)
  }

  static async _calculateCharge (translator, regimeSlug) {
    const rulesPresenter = new PresrocRulesServicePresenter({ ...translator, regime: regimeSlug })
    const response = await RulesService.go(rulesPresenter.go())
    const rulesTranslator = new PreRulesServiceTranslator(response.body)

    return rulesTranslator
  }

  static async _invoice (billRunId, translator) {
    return InvoiceService.go(billRunId, translator)
  }

  static _applyCalculatedCharge (translator, calculatedCharge) {
    Object.assign(translator, calculatedCharge)
  }

  static _create (billRunId, authorisedSystem, regime, translator, invoice) {
    return TransactionModel.transaction(async trx => {
      const transaction = await TransactionModel.query(trx)
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
          chargeValue: translator.chargeValue,
          credit: translator.credit,
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
          calculation: translator.calculation,
          invoiceId: invoice.id
        })
        .returning('*')

      await invoice.$query(trx).patch()

      return transaction
    })
  }

  static _response (transaction) {
    const presenter = new JsonPresenter(transaction)

    return presenter.go()
  }
}

module.exports = CreateBillRunTransactionService
