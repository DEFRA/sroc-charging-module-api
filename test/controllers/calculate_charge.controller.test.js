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
  RegimeHelper,
  RulesServiceHelper
} = require('../support/helpers')

const { presroc: fixtures } = require('../support/fixtures/calculate_charge')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const { ValidateChargeService } = require('../../app/services')

describe('Calculate charge controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))

    // Intercept all requests in this test suite as we don't actually want to call the service. Tell Nock to persist()
    // the interception rather than remove it after the first request
    Nock(RulesServiceHelper.url)
      .post(() => true)
      .reply(200, fixtures.simple.rulesService)
      .persist()
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('Calculating a charge: POST /v2/{regimeSlug}/calculate-charge', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/calculate-charge',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    describe('When the request is valid', () => {
      it('returns the calculated charge', async () => {
        const requestPayload = fixtures.simple.request

        const response = await server.inject(options(authToken, requestPayload))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload).to.equal(fixtures.simple.response)
      })
    })

    describe('When the request is invalid', () => {
      it('returns an error', async () => {
        const requestPayload = GeneralHelper.cloneObject(fixtures.simple.request)
        requestPayload.periodStart = '01-APR-2021'

        const response = await server.inject(options(authToken, requestPayload))

        expect(response.statusCode).to.equal(422)
      })
    })
  })

  describe('Calculating a charge: POST /v3/{regimeSlug}/calculate-charge', () => {
    let validateStub

    beforeEach(async () => {
      validateStub = Sinon.stub(ValidateChargeService, 'go').returns({ response: true })
    })

    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v3/wrls/calculate-charge',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    it('calls ValidateChargeService with the payload and returns its response', async () => {
      const requestPayload = { request: true }
      const response = await server.inject(options(authToken, requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(validateStub.calledOnce).to.be.true()
      expect(validateStub.firstCall.firstArg).to.equal(requestPayload)
      expect(response.statusCode).to.equal(200)
      expect(responsePayload.response).to.exist()
      expect(responsePayload.response).to.be.true()
    })
  })
})
