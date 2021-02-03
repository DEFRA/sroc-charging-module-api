'use strict'

const { RegimeModel } = require('../../../models')
const { CreateBillRunService, CreateTransactionService } = require('../../../services')

const Nock = require('nock')
const { RulesServiceHelper } = require('../../../../test/support/helpers')
const { presroc: requestFixtures } = require('../../../../test/support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../../../../test/support/fixtures/calculate_charge')

class TestBillRunController {
  static async generate (req, h) {
    const regime = await TestBillRunController._findRegime(req.params.regimeId)
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, regime)

    TestBillRunController._generateBillRun(result.billRun.id, req.payload.region, req.auth.credentials.user, regime)
    return h.response(result).code(201)
  }

  static async _generateBillRun (billRunId, region, user, regime) {
    const invoices = await TestBillRunController._invoiceGenerator(billRunId, region)

    for (let i = 0; i < invoices.length; i++) {
      await TestBillRunController._invoiceEngine(invoices[i], user, regime)
    }
  }

  /**
   * Find the regime based on regime 'slug' used in request path
   *
   * For our normal endpoints the regime is pre-loaded into Hapi's `request.app` space by the `AuthorisationPlugin`. But
   * this endpoint is only acessible by an `admin` user who is not linked to any regimes, as it can access them all.
   *
   * So, the request will be authorised but the authorisation plugin won't have returned a regime. This is why we need
   * to find it within the controller as part of the request.
   *
   * @param {string} regimeSlug The regime 'slug' used in the request path
   *
   * @returns {module:RegimeModel} An instance of `RegimeModel` for the matching regime
   */
  static _findRegime (regimeSlug) {
    return RegimeModel.query().findOne({ slug: regimeSlug })
  }

  static _invoiceGenerator (billRunId, region) {
    const invoices = []

    for (let i = 1; i <= 2; i++) {
      invoices.push({
        billRunId,
        region,
        customerReference: `CM${i.toString().padStart(9, '0')}`,
        periodStart: '01-APR-2017',
        periodEnd: '31-MAR-2018',
        licences: [
          {
            licenceNumber: `SROC/TF${i.toString().padStart(4, '0')}/01`,
            type: 'mixed'
          },
          {
            licenceNumber: `SROC/TF${i.toString().padStart(4, '0')}/02`,
            type: 'mixed'
          }
        ]
      })
      invoices.push({
        billRunId,
        region,
        customerReference: `CM${i.toString().padStart(9, '0')}`,
        periodStart: '01-APR-2018',
        periodEnd: '31-MAR-2019',
        licences: [
          {
            licenceNumber: `SROC/TF${i.toString().padStart(4, '0')}/01`,
            type: 'mixed'
          },
          {
            licenceNumber: `SROC/TF${i.toString().padStart(4, '0')}/02`,
            type: 'mixed'
          }
        ]
      })
    }

    return invoices
  }

  static async _invoiceEngine (invoice, authorisedSystem, regime) {
    for (let i = 0; i < invoice.licences.length; i++) {
      const licence = invoice.licences[i]
      if (licence.type === 'mixed') {
        const data = TestBillRunController._debitTransaction(invoice, licence)
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

  static _debitTransaction (invoice, licence) {
    const result = {
      payload: {
        ...requestFixtures.simple,
        region: invoice.region,
        customerReference: invoice.customerReference,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        chargePeriod: `${invoice.periodStart} - ${invoice.periodEnd}`,
        licenceNumber: licence.licenceNumber,
        volume: '50.22'
      },
      response: {
        ...chargeFixtures.simple.rulesService,
        WRLSChargingResponse: {
          ...chargeFixtures.simple.rulesService.WRLSChargingResponse,
          chargeValue: 91.82
        }
      }
    }

    return result
  }
}

module.exports = TestBillRunController
