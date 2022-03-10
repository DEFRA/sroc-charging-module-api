'use strict'

/**
 * @module CreateTransactionService
 */

const Boom = require('@hapi/boom')

const BillRunModel = require('../../models/bill_run.model')
const InvoiceModel = require('../../models/invoice.model')
const LicenceModel = require('../../models/licence.model')
const TransactionModel = require('../../models/transaction.model')

const TransactionPresrocTranslator = require('../../translators/transaction_presroc.translator')
const TransactionSrocTranslator = require('../../translators/transaction_sroc.translator')

const CalculateChargeService = require('../charges/calculate_charge.service')

const CreateTransactionPresenter = require('../../presenters/create_transaction.presenter')

class CreateTransactionService {
  /**
   * Creates a new transaction on the specified bill run.
   *
   * @param {Object} payload The payload from the API request.
   * @param {module:BillRunModel} billRun Instance of `BillRunModel` that the transaction is to be created on.
   * @param {module:AuthorisedSystemModel} authorisedSystem Instance of `AuthorisedSystemModel' representing the
   *  authenticated user.
   * @param {module:RegimeModel} regime Instance of `RegimeModel` representing the regime we are creating the
   *  transaction for.
   * @returns {Object} Details of the newly-created transaction.
   */
  static async go (payload, billRun, authorisedSystem, regime) {
    const transactionTranslator = this._determineTranslator(billRun.ruleset)

    const payloadWithRuleset = { ...payload, ruleset: billRun.ruleset }

    const translator = this._translateRequest(payloadWithRuleset, billRun.id, authorisedSystem, regime, transactionTranslator)

    const calculatedCharge = await this._calculateCharge(translator, regime)

    this._applyCalculatedCharge(translator, calculatedCharge)

    const transaction = await this._create(translator)

    return this._response(transaction)
  }

  static _determineTranslator (ruleset) {
    switch (ruleset) {
      case 'presroc':
        return TransactionPresrocTranslator
      case 'sroc':
        return TransactionSrocTranslator
      default:
        throw Boom.badData('Invalid ruleset')
    }
  }

  static _translateRequest (payload, billRunId, authorisedSystem, regime, TransactionTranslator) {
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

  static _create (translator) {
    return TransactionModel.transaction(async trx => {
      await BillRunModel.patchTally(translator, trx)

      const invoiceId = await InvoiceModel.updateTally(translator, trx)
      Object.assign(translator, { invoiceId })

      const licenceId = await LicenceModel.updateTally(translator, trx)

      return TransactionModel.query(trx)
        .insert({
          ...translator,
          invoiceId,
          licenceId
        })
        .returning(['id', 'client_id'])
    })
  }

  static async _response (transaction) {
    const presenter = new CreateTransactionPresenter(transaction)

    return presenter.go()
  }
}

module.exports = CreateTransactionService
