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
  static async go (licenceToAdjust, billRunId, authorisedSystem, regime) {
    /**
     * We want to receive a licence and we'll pull out the first transaction associated with it to get most of the
     * details we need. Then we just need to set newLicence to TRUE and chargeValue to the argument we receive.
     */

    // Get the first transaction for this licence. Note that this query would still return all records from the db if
    // we only used .first() so we add .limit(1) to ensure only 1 record is returned.
    const transaction = await licenceToAdjust.$relatedQuery('transactions')
      .limit(1)
      .first()

    const transactionTemplate = this._filterTransaction(transaction)

    const calculatedCharge = {
      chargeValue: 772,
      newLicence: true
    }

    this._applyCalculatedCharge(transactionTemplate, calculatedCharge)

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
      Object.entries(transaction).filter(([key, value]) => keepList.includes(key))
    )
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
