'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  DatabaseHelper,
  GeneralHelper,
  NewBillRunHelper,
  NewTransactionHelper,
  RegimeHelper,
  RulesServiceHelper
} = require('../support/helpers')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Bill runs transactions controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
    billRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id)
  })

  after(async () => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('Create a bill run transaction: POST /v2/{regimeSlug}/bill-runs/{billRunId}/transactions', () => {
    let payload

    const options = (token, payload, billRunId) => {
      return {
        method: 'POST',
        url: `/v2/wrls/bill-runs/${billRunId}/transactions`,
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    beforeEach(async () => {
      // Intercept all requests in this group as we don't actually want to call the service. Tell Nock to persist()
      // the interception rather than remove it after the first request
      Nock(RulesServiceHelper.url)
        .post(() => true)
        .reply(200, chargeFixtures.simple.rulesService)
        .persist()

      // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
      // the valid tests we can use it straight as
      payload = GeneralHelper.cloneObject(requestFixtures.simple)
    })

    describe('When the request is valid', () => {
      it("returns the 'id' of the new transaction", async () => {
        const response = await server.inject(options(authToken, payload, billRun.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(201)
        expect(responsePayload.transaction.id).to.exist()
      })
    })

    describe('When the request is invalid', () => {
      describe('because it contains invalid data', () => {
        it('returns an error', async () => {
          payload.periodStart = '01-APR-2021'

          const response = await server.inject(options(authToken, payload, billRun.id))

          expect(response.statusCode).to.equal(422)
        })
      })

      describe("it's for a different region", () => {
        it('returns an error', async () => {
          payload.region = 'W'

          const response = await server.inject(options(authToken, payload, billRun.id))

          expect(response.statusCode).to.equal(422)
        })
      })

      describe("because the request is for a duplicate transaction (matching clientId's)", () => {
        it('returns an error', async () => {
          // Create a transaction. We don't specify a licence for it so the helper will create a whole new licence,
          // invoice and bill run. This is fine as we're going to attempt to create our second transaction on this
          // transaction's bill run, ignoring the existing bill run, but injecting the second transaction will use the regime id of the existing bill run. So we
          // override the regime id of the transaction we create now with the existing bill run's regime id.
          const firstTransaction = await NewTransactionHelper.create(null, { clientId: 'DOUBLEIMPACT', regimeId: billRun.regimeId })

          payload.clientId = 'DOUBLEIMPACT'

          // Attempt to add the second
          const response = await server.inject(options(authToken, payload, firstTransaction.billRunId))

          expect(response.statusCode).to.equal(409)
        })
      })

      describe('because the request is for sroc', () => {
        it('returns an error', async () => {
          const srocBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id, { ruleset: 'sroc' })

          const response = await server.inject(options(authToken, payload, srocBillRun.id))

          expect(response.statusCode).to.equal(422)
        })
      })
    })
  })

  describe('View bill run transaction: GET /v2/{regimeSlug}/bill-runs/{billRunId}/transactions/{transactionId}', () => {
    const options = (token, billRunId, transactionId) => {
      return {
        method: 'GET',
        url: `/v2/wrls/bill-runs/${billRunId}/transactions/${transactionId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      it('returns success status 200', async () => {
        const transaction = await NewTransactionHelper.create()

        const response = await server.inject(options(authToken, transaction.billRunId, transaction.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.transaction.id).to.equal(transaction.id)
      })
    })
  })
})
