'use strict'

/**
 * @module CreateTransactionService
 */

const { BillRunModel, InvoiceModel, LicenceModel, TransactionModel } = require('../models')
const { TransactionTranslator } = require('../translators')
const CreateTransactionBillRunService = require('./create_transaction_bill_run.service')
const CalculateChargeService = require('./calculate_charge.service')
const CreateTransactionInvoiceService = require('./create_transaction_invoice.service')
const CreateTransactionLicenceService = require('./create_transaction_licence.service')
const { CreateTransactionPresenter } = require('../presenters')

class CreateTransactionService {
  static async go (payload, billRun, authorisedSystem, regime) {
    const translator = this._translateRequest(payload, billRun.id, authorisedSystem, regime)

    const calculatedCharge = await this._calculateCharge(translator, regime)

    this._applyCalculatedCharge(translator, calculatedCharge)

    const billRunPatch = await this._generateBillRunPatch(billRun, translator)

    const transaction = await this._create(translator, billRunPatch)

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
   * charge to the translator. It gives us a complete representation of the transaction, fully validated and parsed
   * ready for persisting to the database.
   */
  static _applyCalculatedCharge (translator, calculatedCharge) {
    Object.assign(translator, calculatedCharge)
  }

  static async _generateBillRunPatch (billRun, translator) {
    return CreateTransactionBillRunService.go(billRun, translator)
  }

  static async _generateInvoicePatch (translator) {
    return CreateTransactionInvoiceService.go(translator)
  }

  static async _generateLicencePatch (translator) {
    return CreateTransactionLicenceService.go(translator)
  }

  static _create (translator, billRunPatch) {
    return TransactionModel.transaction(async trx => {
      await BillRunModel.query(trx).findById(billRunPatch.id).patch(billRunPatch.update)
      const invoiceId = await CreateTransactionInvoiceService.go(translator, trx)
      const licenceId = await CreateTransactionLicenceService.go({ ...translator, invoiceId }, trx)

      const transaction = await TransactionModel.query(trx)
        .insert({
          ...translator,
          invoiceId: invoiceId,
          licenceId: licenceId
        })
        .returning(['id', 'client_id'])

      return transaction
    })
  }

  static async _response (transaction) {
    const presenter = new CreateTransactionPresenter(transaction)

    return presenter.go()
  }
}

module.exports = CreateTransactionService
