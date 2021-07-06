/**
 * @module BillRunGenerator
 */

import Boom from '@hapi/boom'
import Nock from 'nock'

import * as fixtures from '../fixtures/fixtures.js'
import CreateTransactionService from '../../../app/services/create_transaction.service.js'
import RulesServiceHelper from '../helpers/rules_service.helper.js'

const chargeFixtures = fixtures.calculateCharge
const requestFixtures = fixtures.createTransaction

export default class BillRunGenerator {
  static async go (payload, billRun, authorisedSystem, regime, notifier = null) {
    try {
      // Mark the start time for later logging
      const startTime = process.hrtime.bigint()

      const invoices = await this._invoiceGenerator(payload)

      for (const i in invoices) {
        await this._invoiceEngine(invoices[i], billRun, authorisedSystem, regime)
      }

      await this._calculateAndLogTime(notifier, billRun.id, startTime)
    } catch (error) {
      this._notifyError(notifier, billRun.id, error)
    }
  }

  static _invoiceGenerator (payload) {
    const invoices = []
    let customerIndex = 0

    payload.mix.forEach(options => {
      for (let i = 0; i < options.count; i++) {
        customerIndex += 1
        const customerReference = `CM${customerIndex.toString().padStart(9, '0')}`
        const licenceNumber = `SROC/TF${customerIndex.toString().padStart(4, '0')}/01`

        invoices.push({
          region: payload.region,
          customerReference: customerReference,
          periodStart: '01-APR-2018',
          periodEnd: '31-MAR-2019',
          licenceNumber: licenceNumber,
          type: options.type
        })
      }
    })

    return invoices
  }

  static async _invoiceEngine (invoice, billRun, authorisedSystem, regime) {
    const invoiceData = {
      invoice,
      billRun,
      authorisedSystem,
      regime
    }

    switch (invoice.type) {
      case 'mixed-invoice':
        await this._mixedInvoice(invoiceData)
        break
      case 'mixed-credit':
        await this._mixedCredit(invoiceData)
        break
      case 'zero-value':
        await this._zeroValueInvoice(invoiceData)
        break
      case 'deminimis':
        await this._deminimisInvoice(invoiceData)
        break
      case 'minimum-charge':
        await this._minimumChargeInvoice(invoiceData)
        break
      default:
        throw Boom.badRequest(`Unknown invoice type '${invoice.type}'`)
    }
  }

  static async _addTransaction (invoiceData) {
    try {
      // Intercept all requests in this generator as we don't actually want to call the service. Tell Nock to persist()
      // the interception rather than remove it after the first request
      Nock(RulesServiceHelper.url)
        .post(() => true)
        .reply(200, invoiceData.data.response)
        .persist()
      await CreateTransactionService.go(
        invoiceData.data.payload,
        invoiceData.billRun,
        invoiceData.authorisedSystem,
        invoiceData.regime
      )
    } finally {
      Nock.cleanAll()
    }
  }

  static async _zeroValueInvoice (invoiceData) {
    const transactionData = [
      invoiceData.invoice,
      '0',
      0
    ]

    invoiceData.data = this._transactionData(...transactionData, false, false)
    await this._addTransaction(invoiceData)
    await this._addTransaction(invoiceData)
    await this._addTransaction(invoiceData)
  }

  static async _deminimisInvoice (invoiceData) {
    const transactionData = [
      invoiceData.invoice,
      '0.5865',
      1.26
    ]

    invoiceData.data = this._transactionData(...transactionData, false, false)
    await this._addTransaction(invoiceData)
    await this._addTransaction(invoiceData)
    await this._addTransaction(invoiceData)
  }

  static async _minimumChargeInvoice (invoiceData) {
    const transactionData = [
      invoiceData.invoice,
      '0.5865',
      1.26
    ]

    invoiceData.data = this._transactionData(...transactionData, false, true)
    await this._addTransaction(invoiceData)
    await this._addTransaction(invoiceData)

    invoiceData.data = this._transactionData(...transactionData, true, true)
    await this._addTransaction(invoiceData)
  }

  static async _mixedInvoice (invoiceData) {
    const transactionData = [
      invoiceData.invoice,
      '50.22',
      91.82
    ]

    invoiceData.data = this._transactionData(...transactionData, false, false)
    await this._addTransaction(invoiceData)
    await this._addTransaction(invoiceData)

    invoiceData.data = this._transactionData(...transactionData, true, false)
    await this._addTransaction(invoiceData)
  }

  static async _mixedCredit (invoiceData) {
    const transactionData = [
      invoiceData.invoice,
      '50.22',
      91.82
    ]

    invoiceData.data = this._transactionData(...transactionData, true, false)
    await this._addTransaction(invoiceData)
    await this._addTransaction(invoiceData)

    invoiceData.data = this._transactionData(...transactionData, false, false)
    await this._addTransaction(invoiceData)
  }

  static _transactionData (invoice, volume, chargeValue, credit, subjectToMinimumCharge) {
    const result = {
      payload: {
        ...this._basePayload(invoice),
        credit,
        volume,
        subjectToMinimumCharge
      },
      response: {
        ...this._baseResponse()
      }
    }
    result.response.WRLSChargingResponse.chargeValue = chargeValue

    return result
  }

  static _basePayload (invoice) {
    return {
      ...requestFixtures.simple,
      region: invoice.region,
      customerReference: invoice.customerReference,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      chargePeriod: `${invoice.periodStart} - ${invoice.periodEnd}`,
      licenceNumber: invoice.licenceNumber
    }
  }

  static _baseResponse () {
    return {
      ...chargeFixtures.simple.rulesService,
      WRLSChargingResponse: {
        ...chargeFixtures.simple.rulesService.WRLSChargingResponse
      }
    }
  }

  /**
   * Log the time taken to auto-generate the bill run using the passed in logger
   *
   * If `logger` is not set then it will do nothing. If it is set this will get the current time and then calculate the
   * difference from `startTime`. This and the `billRunId` are then used to generate a log message.
   *
   * @param {@module:Notifier} notifier Use to log the time taken
   * @param {string} billRunId Id of the bill run currently being 'generated'
   * @param {BigInt} startTime The time the auto-generate process kicked off. It is expected to be the result of a call
   * to `process.hrtime.bigint()`
   */
  static async _calculateAndLogTime (notifier, billRunId, startTime) {
    if (!notifier) {
      return
    }

    const endTime = process.hrtime.bigint()
    const timeTakenNs = endTime - startTime
    const timeTakenMs = timeTakenNs / 1000000n

    notifier.omg(`Time taken to auto-generate bill run '${billRunId}': ${timeTakenMs}ms`)
  }

  /**
   * Log an error if the auto-generate process fails
   *
   * If `notifier` is not set then it will do nothing. If it is set this will log an error message based on the
   * `billRunId` and error provided.
   *
   * @param {@module:Notifier} notifier Use to both log the error in the server logs and record the event in Errbit
   * @param {string} billRunId Id of the bill run currently being 'generated'
   * @param {Object} error The error that was thrown
   */
  static async _notifyError (notifier, billRunId, error) {
    if (!notifier) {
      return
    }

    notifier.omfg('Auto-generate bill run failed', { billRunId, error })
  }
}
