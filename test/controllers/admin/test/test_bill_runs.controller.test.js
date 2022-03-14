'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../../app/server')

// Test helpers
const AuthorisationHelper = require('../../../support/helpers/authorisation.helper')
const AuthorisedSystemHelper = require('../../../support/helpers/authorised_system.helper')
const DatabaseHelper = require('../../../support/helpers/database.helper')
const GeneralHelper = require('../../../support/helpers/general.helper')
const SequenceCounterHelper = require('../../../support/helpers/sequence_counter.helper')
const BillRunModel = require('../../../../app/models/bill_run.model')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Test Bill Run Controller', () => {
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    // This endpoint relies on creating a bill run, which relies on generating a bill run number. So, to support it we
    // need to ensure there is a sequence counter entry for the matching regime and region.
    const authSystem = await AuthorisedSystemHelper.addAdminSystem()
    const regimes = await authSystem.$relatedQuery('regimes')
    const regime = regimes.filter(r => r.slug === 'wrls')[0]
    await SequenceCounterHelper.addSequenceCounter(regime.id, 'A')
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Generating a test bill run: POST /admin/test/{regimeSlug}/bill-runs', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/admin/test/wrls/bill-runs',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    it('creates a bill run with expected invoices and transactions', async () => {
      const requestPayload = {
        region: 'A',
        mix: [
          { type: 'mixed-invoice', count: 1 },
          { type: 'mixed-credit', count: 1 },
          { type: 'zero-value', count: 1 },
          { type: 'deminimis', count: 1 },
          { type: 'minimum-charge', count: 1 },
          { type: 'standard', count: 1 }
        ]
      }

      const response = await server.inject(options(authToken, requestPayload))
      const responsePayload = JSON.parse(response.payload)

      // This endpoint immediately responds with details of the bill run created. But behind the scenes it continues
      // adding transactions to it. When trying to run unit tests we found 2 issues
      //
      // - attempting to interrogate bill run, invoice and transaction details would always fail because it takes a few
      // hundred milliseconds for the process to complete
      // - other tests would start failing because the data the process was adding in the background interfered with
      // them
      //
      // So, the only way we could see to keep a test for this endpoint was to add in an arbitrary delay. In this case
      // we 'sleep' for 1 second (the generate process takes approx 300ms) and then continue. It seems any larger sleep
      // value causes the tests to through a timeout error.
      await GeneralHelper.sleep(1000)

      const billRun = await BillRunModel.query().findById(responsePayload.billRun.id)
      const invoices = await billRun.$relatedQuery('invoices')
      const transactions = await billRun.$relatedQuery('transactions')

      expect(response.statusCode).to.equal(201)
      expect(responsePayload.billRun.id).to.exist()

      expect(invoices.length).to.equal(6)

      expect(transactions.length).to.equal(18)
      expect(transactions.filter(tran => tran.chargeCredit).length).to.equal(4)
      expect(transactions.filter(tran => tran.subjectToMinimumCharge).length).to.equal(3)
    })
  })
})
