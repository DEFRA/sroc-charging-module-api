'use strict'

/**
 * @module CreateMinimumChargeAdjustmentService
 */

const { TransactionModel } = require('../models')
const BillRunService = require('./bill_run.service')
const InvoiceService = require('./invoice.service')
const LicenceService = require('./licence.service')
const { CreateTransactionPresenter } = require('../presenters')

class CreateMinimumChargeAdjustmentService {
  /**
   * Creates a minimum charge adjustment transaction and update summary values accordingly.
   *
   * @param {module:LicenceModel} licenceToAdjust Licence object which will have an adjustment transaction added
   * @returns {module:TransactionModel} A `TransactionModel` instance representing the adjustment transaction
   */
  static async go (licenceToAdjust, chargeValue) {
    // Get the first transaction for this licence as we will use it to get details like billRunId, regime etc. We add
    // .limit(1) to ensure only 1 record is returned from the db.
    const transaction = await licenceToAdjust.$relatedQuery('transactions')
      .limit(1)
      .first()

    const transactionTemplate = this._filterTransaction(transaction)

    this._applyChargeValue(transactionTemplate, chargeValue)
    this._applyNewLicenceFlag(transactionTemplate)

    const billRun = await this._billRun(transactionTemplate)
    const invoice = await this._invoice(transactionTemplate)
    const licence = await this._licence({ ...transactionTemplate, invoiceId: invoice.id })

    const adjustment = await this._create(transactionTemplate, invoice, licence, billRun)

    return this._response(adjustment)
  }

  /**
   * Remove unneeded fields from the transaction.
   *
   * The transaction we get from the licence will include fields we don't want to save for the adjustment transaction
   * (such as charge calculations, the id of the transaction we're using as a template, etc.). This function filters
   * out any fields not in the keep list and returns a cleansed transaction.
   */
  static _filterTransaction (transaction) {
    const keepList = [
      'billRunId',
      'regimeId',
      'createdBy',
      'region',
      'customerReference',
      'lineAttr1',
      'lineAttr2',
      'lineDescription',
      'ruleset',
      'chargeFinancialYear'
    ]

    return Object.fromEntries(
      Object.entries(transaction).filter(([key]) => keepList.includes(key))
    )
  }

  /**
   * Assign the charge value passed to the service to the field chargeValue
   */
  static _applyChargeValue (translator, chargeValue) {
    Object.assign(translator, { chargeValue })
  }

  /**
   * Set the newLicence flag to true
   *
   * Minimum charge adjustment is only applied when an invoice has newLicence set to true, so we would want the
   * adjustment transaction to have newLicence set to true as well
   */
  static _applyNewLicenceFlag (translator) {
    Object.assign(translator, { newLicence: true })
  }

  static async _billRun (transaction) {
    return BillRunService.go(transaction)
  }

  static async _invoice (transaction) {
    return InvoiceService.go(transaction)
  }

  static async _licence (transaction) {
    return LicenceService.go(transaction)
  }

  static _create (transaction, invoice, licence, billRun) {
    return TransactionModel.transaction(async trx => {
      const createdTransaction = await TransactionModel.query(trx)
        .insert({
          ...transaction,
          invoiceId: invoice.id,
          licenceId: licence.id
        })
        .returning('*')

      await invoice.$query(trx).patch()
      await licence.$query(trx).patch()
      await billRun.$query(trx).patch()

      return createdTransaction
    })
  }

  static async _response (transaction) {
    const presenter = new CreateTransactionPresenter(transaction)

    return presenter.go()
  }
}

module.exports = CreateMinimumChargeAdjustmentService
