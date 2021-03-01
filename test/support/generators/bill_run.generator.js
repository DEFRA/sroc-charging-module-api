'use strict'

/**
 * @module BillRunGenerator
 */

const Boom = require('@hapi/boom')
const Nock = require('nock')

const { CreateTransactionService } = require('../../../app/services')

const { RulesServiceHelper } = require('../helpers')
const { presroc: requestFixtures } = require('../fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../fixtures/calculate_charge')

class BillRunGenerator {
  static async go (payload, billRun, authorisedSystem, regime, logger = null) {
    try {
      // Mark the start time for later logging
      const startTime = process.hrtime.bigint()

      const invoices = await this._invoiceGenerator(payload)

      for (const i in invoices) {
        await this._invoiceEngine(invoices[i], billRun, authorisedSystem, regime)
      }

      await this._calculateAndLogTime(logger, billRun.id, startTime)
    } catch (error) {
      this._logError(logger, billRun.id, error)
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
   * @param {function} logger Logger with an 'info' method we use to log the time taken (assumed to be the one added to
   * the Hapi server instance by hapi-pino)
   * @param {string} billRunId Id of the bill run currently being 'generated'
   * @param {BigInt} startTime The time the auto-generate process kicked off. It is expected to be the result of a call
   * to `process.hrtime.bigint()`
   */
  static async _calculateAndLogTime (logger, billRunId, startTime) {
    if (!logger) {
      return
    }

    const endTime = process.hrtime.bigint()
    const timeTakenNs = endTime - startTime
    const timeTakenMs = timeTakenNs / 1000000n

    logger.info(`Time taken to auto-generate bill run '${billRunId}': ${timeTakenMs}ms`)
  }

  /**
   * Log an error if the auto-generate process fails
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

    logger.info(`Auto-generate bill run '${billRunId}' failed: ${error.message} - ${error}`)
  }
}

module.exports = BillRunGenerator
