'use strict'

/**
 * @module GenerateBillRunService
 */

// Files in the same folder cannot be destructured from index.js so have to be required directly
const CalculateMinimumChargeService = require('./calculate_minimum_charge.service')

const { BillRunModel, InvoiceModel, LicenceModel, TransactionModel } = require('../models')
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
    try {
      // Mark the start time for later logging
      const startTime = process.hrtime.bigint()

      const billRun = await BillRunModel.query().findById(billRunId)
      await this._generateBillRun(billRun)

      await this._calculateAndLogTime(logger, billRunId, startTime)
    } catch (error) {
      this._logError(logger, billRunId, error)
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
      const minimumChargePatch = await this._minimumChargePatch(transaction)

      // Since we're only patching invoices which have a minimum charge adjustment transaction, we can set the
      // minimumChargeInvoice flag to true at this stage rather than doing it as a separate step in _summariseBillRun.
      const invoicePatch = {
        ...minimumChargePatch,
        minimumChargeInvoice: true
      }

      await TransactionModel.query(trx).insert(transaction)

      await BillRunModel.query(trx).findById(transaction.billRunId).patch(minimumChargePatch)
      await InvoiceModel.query(trx).findById(transaction.invoiceId).patch(invoicePatch)
      await LicenceModel.query(trx).findById(transaction.licenceId).patch(minimumChargePatch)
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

  /**
   * Log the time taken to generate the bill run using the passed in logger
   *
   * If `logger` is not set then it will do nothing. If it is set this will get the current time and then calculate the
   * difference from `startTime`. This and the `billRunId` are then used to generate a log message.
   *
   * @param {function} logger Logger with an 'info' method we use to log the time taken (assumed to be the one added to
   * the Hapi server instance by hapi-pino)
   * @param {string} billRunId Id of the bill run currently being 'generated'
   * @param {BigInt} startTime The time the generate process kicked off. It is expected to be the result of a call to
   * `process.hrtime.bigint()`
   */
  static async _calculateAndLogTime (logger, billRunId, startTime) {
    if (!logger) {
      return
    }

    const endTime = process.hrtime.bigint()
    const timeTakenNs = endTime - startTime
    const timeTakenMs = timeTakenNs / 1000000n

    logger.info(`Time taken to generate bill run '${billRunId}': ${timeTakenMs}ms`)
  }

  /**
   * Log an error if the generate process fails
   *
   * If `logger` is not set then it will do nothing. If it is set this will log an error message based on the
   * `billRunId` and error provided.
   *
   * @param {function} logger Logger with an 'info' method we use to log the error (assumed to be the one added to
   * the Hapi server instance by hapi-pino)
   * @param {string} billRunId Id of the bill run currently being 'generated'
   * @param {Object} error The error that was thrown
   */
  static async _logError (logger, billRunId, error) {
    if (!logger) {
      return
    }

    logger.info(`Generate bill run '${billRunId}' failed: ${error.message} - ${error}`)
  }
}

module.exports = GenerateBillRunService
