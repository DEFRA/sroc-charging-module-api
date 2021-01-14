'use strict'

/**
 * @module CreateTransactionService
 */

const { TransactionModel } = require('../models')
const { TransactionTranslator } = require('../translators')
const BillRunService = require('./bill_run.service')
const CalculateChargeService = require('./calculate_charge.service')
const InvoiceService = require('./invoice.service')
const LicenceService = require('./licence.service')
const { CreateTransactionPresenter } = require('../presenters')

class CreateTransactionService {
  static async go (payload, billRunId, authorisedSystem, regime) {
    const translator = this._translateRequest(payload, billRunId, authorisedSystem, regime)

    // TODO: Retain the result of this method call once we start updating the summary details of the bill run. For now,
    // it is used to confirm the bill run exists and is in an 'editable' state
    await this._billRun(translator)

    const calculatedCharge = await this._calculateCharge(translator, regime)

    this._applyCalculatedCharge(translator, calculatedCharge)

    const invoice = await this._invoice(translator)
    const licence = await this._licence({ ...translator, invoiceId: invoice.id })

    const transaction = await this._create(translator, invoice, licence)

    return this._response(transaction)
  }

  static _translateRequest (payload, billRunId, authorisedSystem, regime) {
    return new TransactionTranslator({
      ...payload,
      billRunId,
      regimeId: regime.id,
      authorisedSystemId: authorisedSystem.id
    })
  }

  static async _billRun (transaction) {
    return BillRunService.go(transaction)
  }

  static _calculateCharge (translator, regime) {
    // The CalculateChargeService expects data to be presented using the original request properties, for example,
    // `waterUndertaker` not `regimeValue14`. `validatedData` on the translator gives us access to the data in this
    // original format which is why we pass it in. The underlying data itself though remains the same!
    return CalculateChargeService.go(translator.validatedData, regime, false)
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
    Object.assign(translator, calculatedCharge)
  }

  static async _invoice (translator) {
    return InvoiceService.go(translator)
  }

  static async _licence (translator) {
    return LicenceService.go(translator)
  }

  static _create (translator, invoice, licence) {
    return TransactionModel.transaction(async trx => {
      const transaction = await TransactionModel.query(trx)
        .insert({
          ...translator,
          invoiceId: invoice.id,
          licenceId: licence.id
        })
        .returning('*')

      await invoice.$query(trx).patch()
      await licence.$query(trx).patch()

      return transaction
    })
  }

  static async _response (transaction) {
    const presenter = new CreateTransactionPresenter(transaction)

    return presenter.go()
  }
}

module.exports = CreateTransactionService
