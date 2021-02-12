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
const { raw } = require('../models/base.model')

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
      await this._saveTransactions(minimumChargeAdjustments, trx)
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
      const minimumChargePatch = await this._minimumChargePatch(transaction)
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
      await BillRunModel.query(trx).findById(transaction.billRunId).patch(minimumChargePatch)
    }
  }

  static async _minimumChargePatch (translator) {
    let update = {
      subjectToMinimumChargeCount: raw('subject_to_minimum_charge_count + 1')
    }

    if (translator.chargeCredit) {
      update = {
        ...update,
        creditCount: raw('credit_count + 1'),
        creditValue: raw(`credit_value + ${translator.chargeValue}`),
        subjectToMinimumChargeCreditValue: raw(`subject_to_minimum_charge_credit_value + ${translator.chargeValue}`)
      }
    } else {
      update = {
        ...update,
        debitCount: raw('debit_count + 1'),
        debitValue: raw(`debit_value + ${translator.chargeValue}`),
        subjectToMinimumChargeDebitValue: raw(`subject_to_minimum_charge_debit_value + ${translator.chargeValue}`)
      }
    }
    return update
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
