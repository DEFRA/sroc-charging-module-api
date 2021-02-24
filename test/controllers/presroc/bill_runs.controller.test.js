'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../../server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper,
  RulesServiceHelper,
  SequenceCounterHelper
} = require('../../support/helpers')

const { CreateTransactionService } = require('../../../app/services')

const { presroc: requestFixtures } = require('../../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../../support/fixtures/calculate_charge')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Presroc Bill Runs controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun

  before(async () => {
    server = await deployment()
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))

    // Intercept all requests in this test suite as we don't actually want to call the service. Tell Nock to persist()
    // the interception rather than remove it after the first request
    Nock(RulesServiceHelper.url)
      .post(() => true)
      .reply(200, chargeFixtures.simple.rulesService)
      .persist()
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('Adding a bill run: POST /v2/{regimeId}/bill-runs', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/bill-runs',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    it("adds a new bill run and returns it's details including the 'id'", async () => {
      const requestPayload = {
        region: 'A'
      }

      await SequenceCounterHelper.addSequenceCounter(regime.id, requestPayload.region)

      const response = await server.inject(options(authToken, requestPayload))
      const responsePayload = JSON.parse(response.payload)
      const { billRun } = responsePayload

      expect(response.statusCode).to.equal(201)
      expect(billRun.id).to.exist()
      expect(billRun.billRunNumber).to.exist()
      expect(billRun).to.have.length(2)
    })

    it('will not add a bill run with invalid data', async () => {
      const requestPayload = {
        region: 'Z'
      }

      await SequenceCounterHelper.addSequenceCounter(regime.id, requestPayload.region)

      const response = await server.inject(options(authToken, requestPayload))

      expect(response.statusCode).to.equal(422)
    })
  })

  describe('Generate a bill run summary: PATCH /v2/{regimeId}/bill-runs/{billRunId}/generate', () => {
    let payload

    const options = (token, billRunId) => {
      return {
        method: 'PATCH',
        url: `/v2/wrls/bill-runs/${billRunId}/generate`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

      // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
      // the valid tests we can use it straight as
      payload = GeneralHelper.cloneObject(requestFixtures.simple)
    })

    describe('When the request is valid', () => {
      describe('because the summary has not yet been generated', () => {
        it('returns success status 204 (IMPORTANT! Does not mean generation completed successfully)', async () => {
          const requestPayload = GeneralHelper.cloneObject(requestFixtures.simple)
          await CreateTransactionService.go(requestPayload, billRun.id, authorisedSystem, regime)

          const response = await server.inject(options(authToken, billRun.id))

          expect(response.statusCode).to.equal(204)
        })
      })
    })

    describe('When the request is invalid', () => {
      describe('because the summary has already been generated', () => {
        it('returns error status 409', async () => {
          const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, payload.region, 'generating')

          const response = await server.inject(options(authToken, generatingBillRun.id))
          const responsePayload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(409)
          expect(responsePayload.message).to.equal(`Bill run ${generatingBillRun.id} cannot be edited because its status is generating.`)
        })
      })
    })
  })

  describe('Get bill run status: GET /v2/{regimeId}/bill-runs/{billRunId}/status', () => {
    const options = (token, billRunId) => {
      return {
        method: 'GET',
        url: `/v2/wrls/bill-runs/${billRunId}/status`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      it('returns success status 200', async () => {
        billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

        const response = await server.inject(options(authToken, billRun.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.status).to.equal(billRun.status)
      })
    })

    describe('When the request is invalid', () => {
      describe('because the bill run does not exist', () => {
        it('returns error status 404', async () => {
          const unknownBillRunId = GeneralHelper.uuid4()
          const response = await server.inject(options(authToken, unknownBillRunId))
          const responsePayload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(404)
          expect(responsePayload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
        })
      })
    })
  })

  describe('View bill run: GET /v2/{regimeId}/bill-runs/{billRunId}', () => {
    const options = (token, billRunId) => {
      return {
        method: 'GET',
        url: `/v2/wrls/bill-runs/${billRunId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      it('returns success status 200', async () => {
        billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

        const response = await server.inject(options(authToken, billRun.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.billRun.id).to.equal(billRun.id)
      })
    })

    describe('When the request is invalid', () => {
      describe('because the bill run does not exist', () => {
        it('returns error status 404', async () => {
          const unknownBillRunId = GeneralHelper.uuid4()
          const response = await server.inject(options(authToken, unknownBillRunId))
          const responsePayload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(404)
          expect(responsePayload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
        })
      })
    })
  })
})
