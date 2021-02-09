'use strict'

/**
 * @module GenerateBillRunService
 */

// Files in the same folder cannot be destructured from index.js so have to be required directly
const BillRunService = require('./bill_run.service')
const CalculateMinimumChargeService = require('./calculate_minimum_charge.service')
const InvoiceService = require('./invoice.service')
const LicenceService = require('./licence.service')

const { BillRunModel, TransactionModel } = require('../models')

class GenerateBillRunService {
  /**
  * Initiates bill run generation. Note that nothing is returned from the service -- the intention is that it will be
  * called and left to run.
  *
  * @param {string} billRunId The id of the bill run to be generated.
  * @param {object} [logger] Server logger object. If passed in then logger.info will be called to log the time taken.
  */
  static async go (billRunId, logger = '') {
    // Mark the start time for later logging
    const startTime = process.hrtime()

    const billRun = await BillRunModel.query().findById(billRunId)
    await this._generateBillRun(billRun)

    // If a logger object was passed in, measure how long we took and use it to log the time
    if (logger) {
      const endTime = process.hrtime(startTime)
      const timeInMs = this._formatTime(endTime)
      this._logTime(timeInMs, logger)
    }
  }

  /**
   * Format the time returned from process.hrtime() to milliseconds
   *
   * process.hrtime() returns an array t of 2 numbers: t[0] is seconds and t[1] is nanoseconds. We could just log the
   * seconds taken but for consistency and accuracy we convert it all to milliseconds:
   *   (t[0] * 1e9 + t[1]) / 1e6
   *
   * We multiply t[0] by 1e9 to convert to nanoseconds, add t[1] to get the total time in nanoseconds, then divide by
   * 1e6 to get the total time in milliseconds, which we then round to the nearest integer.
   *
   * @param {array} time The time array returned by process.hrtime()
   *
   * @returns {integer} The time converted to milliseconds
   */
  static _formatTime (timeArray) {
    const timeInMs = (timeArray[0] * 1e9 + timeArray[1]) / 1e6
    return Math.round(timeInMs)
  }

  /**
   * Use a passed-in logger to log the time taken to generate the bill run
   *
   * @param {integer} time Time to log in ms
   * @param {function} logger Logger with an 'info' method we use to log the time taken
   */
  static _logTime (time, logger) {
    logger.info(`Time taken to generate bill run: ${time}ms`)
  }

  static async _generateBillRun (billRun) {
    await this._setGeneratingStatus(billRun)

    const minimumValueAdjustments = await CalculateMinimumChargeService.go(billRun)

    await BillRunModel.transaction(async trx => {
      await this._saveTransactions(minimumValueAdjustments, trx)
      await this._summariseBillRun(billRun, trx)
    })
  }

  static async _setGeneratingStatus (billRun) {
    await billRun.$query()
      .patch({ status: 'generating' })
  }

  static _calculateInvoices (invoices) {
    return {
      count: invoices.length,
      value: this._sumInvoices(invoices)
    }
  }

  static _sumInvoices (invoices) {
    // We only ever persist positive values -- however the net total of credit invoices is always negative so we use
    // $absoluteNetTotal to enforce this.
    return invoices.reduce((sum, invoice) => sum + invoice.$absoluteNetTotal(), 0)
  }

  static async _saveTransactions (transactions, trx) {
    for (const transaction of transactions) {
      const billRun = await this._billRun(transaction)
      const invoice = await this._invoice(transaction)
      const licence = await this._licence({ ...transaction, invoiceId: invoice.id })

      await TransactionModel.query(trx)
        .insert({
          ...transaction,
          invoiceId: invoice.id,
          licenceId: licence.id
        })

      await invoice.$query(trx).patch()
      await licence.$query(trx).patch()
      await billRun.$query(trx).patch()
    }
  }

  static async _billRun (translator) {
    // We pass true to BillRunService to indicate we're calling it as part of the bill run generation process; this
    // tells it that it's okay to update the summary even though its state is $generating.
    return BillRunService.go(translator, true)
  }

  static async _invoice (translator) {
    return InvoiceService.go(translator)
  }

  static async _licence (translator) {
    return LicenceService.go(translator)
  }

  static async _summariseBillRun (billRun, trx) {
    await this._summariseDebitInvoices(billRun, trx)
    await this._summariseCreditInvoices(billRun, trx)
    await this._summariseZeroValueInvoices(billRun, trx)
    await this._summariseDeminimisInvoices(billRun, trx)
    await this._setGeneratedStatus(billRun, trx)
  }

  static async _summariseDebitInvoices (billRun, trx) {
    const { count: invoiceCount, value: invoiceValue } = await this._calculateInvoices(
      await billRun.$relatedQuery('invoices').modify('debit')
    )

    await billRun.$query(trx)
      .patch({
        invoiceCount,
        invoiceValue
      })
  }

  static async _summariseCreditInvoices (billRun, trx) {
    const { count: creditNoteCount, value: creditNoteValue } = await this._calculateInvoices(
      await billRun.$relatedQuery('invoices').modify('credit')
    )

    await billRun.$query(trx)
      .patch({
        creditNoteCount,
        creditNoteValue
      })
  }

  static async _summariseZeroValueInvoices (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('zeroValue')
      .patch({ zeroValueInvoice: true })
  }

  static async _summariseDeminimisInvoices (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('deminimis')
      .patch({ deminimisInvoice: true })
  }

  static async _setGeneratedStatus (billRun, trx) {
    await billRun.$query(trx)
      .patch({ status: 'generated' })
  }
}

module.exports = GenerateBillRunService
