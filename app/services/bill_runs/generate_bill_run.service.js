'use strict'

/**
 * @module GenerateBillRunService
 */

// Files in the same folder cannot be destructured from index.js so have to be required directly
const CalculateMinimumChargeForBillRunService = require('./calculate_minimum_charge_for_bill_run.service')

const { BillRunModel, InvoiceModel, LicenceModel, TransactionModel } = require('../../models')
const { raw } = require('../../models/base.model')

class GenerateBillRunService {
  /**
  * Initiates bill run generation
  *
  * Note! Nothing is returned from the service -- the intention is that it will be called and left to run.
  *
  * @param {@module:BillRunModel} billRun Instance of the bill run to be generated
  * @param {@module:RequestNotifierLib} [notifier] Instance of `RequestNotifierLib` class. If passed in it will be used
  * to log the time taken.
  */
  static async go (billRun, notifier = '') {
    try {
      // Mark the start time for later logging
      const startTime = process.hrtime.bigint()

      await this._generateBillRun(billRun)

      await this._calculateAndLogTime(notifier, billRun.id, startTime)
    } catch (error) {
      this._notifyError(notifier, billRun.id, error)
    }
  }

  static async _generateBillRun (billRun) {
    await this._setGeneratingStatus(billRun)

    const minimumChargeAdjustments = await CalculateMinimumChargeForBillRunService.go(billRun)

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
        creditLineCount: raw('credit_line_count + 1'),
        creditLineValue: raw(`credit_line_value + ${translator.chargeValue}`),
        subjectToMinimumChargeCreditValue: raw(`subject_to_minimum_charge_credit_value + ${translator.chargeValue}`)
      }
    } else {
      update = {
        ...update,
        debitLineCount: raw('debit_line_count + 1'),
        debitLineValue: raw(`debit_Line_value + ${translator.chargeValue}`),
        subjectToMinimumChargeDebitValue: raw(`subject_to_minimum_charge_debit_value + ${translator.chargeValue}`)
      }
    }
    return update
  }

  static async _summariseBillRun (billRun, trx) {
    await this._setDeminimisInvoiceFlags(billRun, trx)
    await this._setZeroValueInvoiceFlags(billRun, trx)
    await this._summariseDebitInvoices(billRun, trx)
    await this._summariseCreditInvoices(billRun, trx)
    await this._setGeneratedStatus(billRun, trx)
  }

  static async _summariseDebitInvoices (billRun, trx) {
    const { count: invoiceCount, value: invoiceValue } = await this._calculateInvoices(
      await billRun.$relatedQuery('invoices', trx).modify('debit').where('deminimisInvoice', false)
    )

    await billRun.$query(trx)
      .patch({
        invoiceCount,
        invoiceValue
      })
  }

  static async _summariseCreditInvoices (billRun, trx) {
    // Note that we don't specify .where('deminimisInvoice', false) as we do with debit invoices as credit invoices
    // aren't subject to deminimis
    const { count: creditNoteCount, value: creditNoteValue } = await this._calculateInvoices(
      await billRun.$relatedQuery('invoices', trx).modify('credit')
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
   * If `notifier` is not set then it will do nothing. If it is set this will get the current time and then calculate the
   * difference from `startTime`. This and the `billRunId` are then used to generate a log message.
   *
   * @param {@module:Notifier} notifier Use to log the time taken
   * @param {string} billRunId Id of the bill run currently being 'generated'
   * @param {BigInt} startTime The time the generate process kicked off. It is expected to be the result of a call to
   * `process.hrtime.bigint()`
   */
  static async _calculateAndLogTime (notifier, billRunId, startTime) {
    if (!notifier) {
      return
    }

    const endTime = process.hrtime.bigint()
    const timeTakenNs = endTime - startTime
    const timeTakenMs = timeTakenNs / 1000000n

    notifier.omg(`Time taken to generate bill run '${billRunId}': ${timeTakenMs}ms`)
  }

  /**
   * Log and record in Errbit if the generate process fails
   *
   * If `notifier` is not set then it will do nothing. If it is set this will log an error message based on the
   * `billRunId` and error provided plus record the event in Errbit.
   *
   * @param {@module:Notifier} notifier Use to both log the error in the server logs and record the event in Errbit
   * @param {string} billRunId Id of the bill run currently being 'generated'
   * @param {Object} error The error that was thrown
   */
  static async _notifyError (notifier, billRunId, error) {
    if (!notifier) {
      return
    }

    notifier.omfg('Generate bill run failed', { billRunId, error })
  }
}

module.exports = GenerateBillRunService
