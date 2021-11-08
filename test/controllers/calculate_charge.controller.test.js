'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  DatabaseHelper,
  RegimeHelper
} = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const { CalculateChargeService, CalculateChargeV2GuardService, ValidateChargeService } = require('../../app/services')

describe.only('Calculate charge controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
  })

  describe.only('Calculating a charge: POST /v2/{regimeSlug}/calculate-charge', () => {
    let calculateStub
    let guardStub
    let requestPayload
    let response
    let responsePayload

    beforeEach(async () => {
      calculateStub = Sinon.stub(CalculateChargeService, 'go').returns({ response: true })
      guardStub = Sinon.stub(CalculateChargeV2GuardService, 'go')

      requestPayload = { request: true }
      response = await server.inject(options(authToken, requestPayload))
      responsePayload = JSON.parse(response.payload)
    })

    afterEach(async () => {
      calculateStub.restore()
      guardStub.restore()
    })

    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/calculate-charge',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    beforeEach(async () => {
    })

    it('calls CalculateChargeService with the payload and returns its response', async () => {
      expect(calculateStub.calledOnce).to.be.true()
      // Note that we expect the argument to _contain_ the request payload as it should also include the default ruleset
      expect(calculateStub.firstCall.firstArg).to.contain(requestPayload)
      expect(response.statusCode).to.equal(200)
      expect(responsePayload.response).to.exist()
      expect(responsePayload.response).to.be.true()
    })

    it('defaults the ruleset to `presroc`', async () => {
      expect(calculateStub.firstCall.firstArg).to.contain({ ruleset: 'presroc' })
    })

    it('calls CalculateChargeV2GuardService', async () => {
      expect(guardStub.calledOnce).to.be.true()
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
