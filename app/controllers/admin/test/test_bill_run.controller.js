'use strict'

const { CreateBillRunService, CreateTransactionService } = require('../../../services')

const Nock = require('nock')
const { RulesServiceHelper } = require('../../../../test/support/helpers')
const { presroc: requestFixtures } = require('../../../../test/support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../../../../test/support/fixtures/calculate_charge')

class TestBillRunController {
  static async generate (req, h) {
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, req.app.regime)
    const invoiceMix = [
      { type: 'mixed-invoice', count: 2 }
    ]

    TestBillRunController._generateBillRun(
      result.billRun.id,
      req.payload.region,
      req.auth.credentials.user,
      req.app.regime,
      invoiceMix
    )
    return h.response(result).code(201)
  }

  static async _generateBillRun (billRunId, region, user, regime, invoiceMix) {
    const invoices = await TestBillRunController._invoiceGenerator(billRunId, region, invoiceMix)

    for (let i = 0; i < invoices.length; i++) {
      await TestBillRunController._invoiceEngine(invoices[i], user, regime)
    }
  }

  static _invoiceGenerator (billRunId, region, invoiceMix) {
    const invoices = []
    let customerIndex = 0

    invoiceMix.forEach(options => {
      for (let i = 0; i < options.count; i++) {
        customerIndex += 1
        const customerReference = `CM${customerIndex.toString().padStart(9, '0')}`
        const licenceNumber = `SROC/TF${customerIndex.toString().padStart(4, '0')}/01`

        invoices.push({
          billRunId,
          region,
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

  static async _invoiceEngine (invoice, authorisedSystem, regime) {
    const invoiceData = {
      invoice,
      authorisedSystem,
      regime
    }
    if (invoice.type === 'mixed-invoice') {
      await TestBillRunController._mixedInvoice(invoiceData)
    }
  }

  static async _addTransaction (invoiceData) {
    try {
      // Intercept all requests in this test suite as we don't actually want to call the service. Tell Nock to persist()
      // the interception rather than remove it after the first request
      Nock(RulesServiceHelper.url)
        .post(() => true)
        .reply(200, invoiceData.data.response)
        .persist()
      await CreateTransactionService.go(
        invoiceData.data.payload,
        invoiceData.invoice.billRunId,
        invoiceData.authorisedSystem,
        invoiceData.regime
      )
    } finally {
      Nock.cleanAll()
    }
  }

  static async _mixedInvoice (invoiceData) {
    invoiceData.data = TestBillRunController._simpleDebitTransaction(invoiceData.invoice)
    await TestBillRunController._addTransaction(invoiceData)
    await TestBillRunController._addTransaction(invoiceData)

    invoiceData.data = TestBillRunController._simpleCreditTransaction(invoiceData.invoice)
    await TestBillRunController._addTransaction(invoiceData)
  }

  static _simpleDebitTransaction (invoice) {
    return TestBillRunController._baseTransaction(invoice, '50.22', 91.82)
  }

  static _simpleCreditTransaction (invoice) {
    return TestBillRunController._baseTransaction(invoice, '20.5865', 44.32, true)
  }

  static _baseTransaction (invoice, volume, chargeValue, credit = false) {
    const result = {
      payload: {
        ...TestBillRunController._basePayload(invoice),
        credit,
        volume
      },
      response: {
        ...TestBillRunController._baseResponse()
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
}

module.exports = TestBillRunController
