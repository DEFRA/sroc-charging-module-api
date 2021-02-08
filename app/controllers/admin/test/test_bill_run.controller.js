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
      {
        type: 'mixed',
        count: 2
      }
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
          licences: [{
            licenceNumber: licenceNumber,
            type: options.type
          }]
        })
      }
    })

    return invoices
  }

  static async _invoiceEngine (invoice, authorisedSystem, regime) {
    for (let i = 0; i < invoice.licences.length; i++) {
      const licence = invoice.licences[i]
      if (licence.type === 'mixed') {
        let data = TestBillRunController._simpleDebitTransaction(invoice, licence)
        await TestBillRunController._addTransaction(invoice.billRunId, authorisedSystem, regime, data)
        await TestBillRunController._addTransaction(invoice.billRunId, authorisedSystem, regime, data)

        data = TestBillRunController._simpleCreditTransaction(invoice, licence)
        await TestBillRunController._addTransaction(invoice.billRunId, authorisedSystem, regime, data)
      }
    }
  }

  static async _addTransaction (billRunId, authorisedSystem, regime, data) {
    try {
      // Intercept all requests in this test suite as we don't actually want to call the service. Tell Nock to persist()
      // the interception rather than remove it after the first request
      Nock(RulesServiceHelper.url)
        .post(() => true)
        .reply(200, data.response)
        .persist()
      await CreateTransactionService.go(data.payload, billRunId, authorisedSystem, regime)
    } finally {
      Nock.cleanAll()
    }
  }

  static _simpleDebitTransaction (invoice, licence) {
    return TestBillRunController._baseTransaction(invoice, licence, '50.22', 91.82)
  }

  static _simpleCreditTransaction (invoice, licence) {
    return TestBillRunController._baseTransaction(invoice, licence, '20.5865', 44.32, true)
  }

  static _baseTransaction (invoice, licence, volume, chargeValue, credit = false) {
    const result = {
      payload: {
        ...TestBillRunController._basePayload(invoice, licence),
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

  static _basePayload (invoice, licence) {
    return {
      ...requestFixtures.simple,
      region: invoice.region,
      customerReference: invoice.customerReference,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      chargePeriod: `${invoice.periodStart} - ${invoice.periodEnd}`,
      licenceNumber: licence.licenceNumber
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
