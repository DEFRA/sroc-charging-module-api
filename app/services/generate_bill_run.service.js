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
    const startTime = process.hrtime.bigint()

    const billRun = await BillRunModel.query().findById(billRunId)
    await this._generateBillRun(billRun)

    if (logger) {
      const endTime = process.hrtime.bigint()
      const timeInMs = this._calculateTime(startTime, endTime)
      await this._logTime(timeInMs, logger)
    }
  }

  static async _generateBillRun (billRun) {
    await this._setGeneratingStatus(billRun)

    const minimumChargeAdjustments = await CalculateMinimumChargeService.go(billRun)

    await BillRunModel.transaction(async trx => {
      await this._saveMinimumChargeTransactions(minimumChargeAdjustments, trx)
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

  static async _saveMinimumChargeTransactions (transactions, trx) {
    for (const transaction of transactions) {
      const billRun = await this._billRun(transaction)
      const invoice = await this._minimumChargeInvoice(transaction)
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

  /**
   *
   * InvoiceService returns the invoice of the transaction we pass to it. Since we only ever call it here as part of the
   * process of saving minimum charge transactions, we set the invoice's minimumChargeInvoice flag to true before we
   * return it. This means we don't need the separate step afterwards of identifying minimum charge invoices and
   * patching their flag to true.
   *
   * Note that we can't just return { ...invoice, minimumChargeInvoice: true } as this would no longer be an Objection
   * object.
   */
  static async _minimumChargeInvoice (translator) {
    const invoice = await InvoiceService.go(translator)
    Object.assign(invoice, { minimumChargeInvoice: true })
    return invoice
  }

  static async _licence (translator) {
    return LicenceService.go(translator)
  }

  static async _summariseBillRun (billRun, trx) {
    await this._summariseDebitInvoices(billRun, trx)
    await this._summariseCreditInvoices(billRun, trx)
    await this._setZeroValueInvoiceFlags(billRun, trx)
    await this._setDeminimisInvoiceFlags(billRun, trx)
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

  static async _setZeroValueInvoiceFlags (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('zeroValue')
      .patch({ zeroValueInvoice: true })
  }

  static async _setDeminimisInvoiceFlags (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('deminimis')
      .patch({ deminimisInvoice: true })
  }

  static async _setGeneratedStatus (billRun, trx) {
    await billRun.$query(trx)
      .patch({ status: 'generated' })
  }

  static _calculateTime (startTime, endTime) {
    const nanoseconds = endTime - startTime
    const milliseconds = nanoseconds / 1000000n
    return milliseconds
  }

  /**
   * Use a passed-in logger to log the time taken to generate the bill run
   *
   * @param {integer} time Time to log in ms
   * @param {function} logger Logger with an 'info' method we use to log the time taken
   */
  static async _logTime (time, logger) {
    logger.info(`Time taken to generate bill run: ${time}ms`)
  }
}

module.exports = GenerateBillRunService
