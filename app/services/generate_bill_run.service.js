'use strict'

/**
 * @module GenerateBillRunService
 */

const Boom = require('@hapi/boom')

// Files in the same folder cannot be destructured from index.js so have to be required directly
const BillRunService = require('./bill_run.service')
const CalculateMinimumChargeService = require('./calculate_minimum_charge.service')
const InvoiceService = require('./invoice.service')
const LicenceService = require('./licence.service')

const { BillRunModel, TransactionModel } = require('../models')

class GenerateBillRunService {
  /**
  * Initiates the generation of a bill run summary.
  *
  * @param
  * @returns
  */
  static async go (billRunId) {
    const billRun = await BillRunModel.query().findById(billRunId)
    await this._validateBillRun(billRun, billRunId)

    const minimumValueAdjustments = await CalculateMinimumChargeService.go(billRun)

    await BillRunModel.transaction(async trx => {
      await this._setGeneratingStatus(billRun, trx)
      await this._saveTransactions(minimumValueAdjustments, trx)
      await this._summariseBillRun(billRun, trx)
    })

    return billRun
  }

  static _validateBillRun (billRun, billRunId) {
    if (!billRun) {
      throw Boom.badData(`Bill run ${billRunId} is unknown.`)
    }

    if (billRun.$generating()) {
      throw Boom.conflict(`Summary for bill run ${billRun.id} is already being generated`)
    }

    if (!billRun.$editable()) {
      throw Boom.badData(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }

    if (billRun.$empty()) {
      throw Boom.badData(`Summary for bill run ${billRun.id} cannot be generated because it has no transactions.`)
    }
  }

  static async _setGeneratingStatus (billRun, trx) {
    await billRun.$query(trx)
      .patch({ status: 'generating' })
  }

  static async _saveTransactions (transactions, trx) {
    const allSavedTransactions = []

    for (const transaction of transactions) {
      const billRun = await this._billRun(transaction)
      const invoice = await this._invoice(transaction)
      const licence = await this._licence({ ...transaction, invoiceId: invoice.id })

      const savedTransaction = await TransactionModel.query(trx)
        .insert({
          ...transaction,
          invoiceId: invoice.id,
          licenceId: licence.id
        })
        .returning('*')

      allSavedTransactions.push(savedTransaction)

      await invoice.$query(trx).patch()
      await licence.$query(trx).patch()
      await billRun.$query(trx).patch()
    }

    return allSavedTransactions
  }

  static async _billRun (translator) {
    /**
     * We pass true to BillRunService to indicate we're calling it as part of the bill run generation process; this
     * tells it that it's okay to update the summary even though its state is $generating.
     */
    return BillRunService.go(translator, true)
  }

  static async _invoice (translator) {
    return InvoiceService.go(translator)
  }

  static async _licence (translator) {
    return LicenceService.go(translator)
  }

  static async _summariseBillRun (billRun, trx) {
    await this._summariseZeroValueInvoices(billRun, trx)
    await this._summariseDeminimisInvoices(billRun, trx)
  }

  static async _summariseZeroValueInvoices (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('zeroValue')
      .patch({ summarised: true })
  }

  static async _summariseDeminimisInvoices (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('deminimis')
      .patch({ summarised: true })
  }
}

module.exports = GenerateBillRunService
