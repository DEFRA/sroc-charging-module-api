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
const AuthorisationHelper = require('../support/helpers/authorisation.helper.js')
const AuthorisedSystemHelper = require('../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const RegimeHelper = require('../support/helpers/regime.helper.js')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const CalculateChargeService = require('../../app/services/charges/calculate_charge.service.js')
const CalculateChargeV2GuardService = require('../../app/services/guards/calculate_charge_v2_guard.service.js')

describe('Calculate charge controller', () => {
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

  describe('Calculating a charge: POST /v2/{regimeSlug}/calculate-charge', () => {
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

    it('calls CalculateChargeService with the payload and returns its response', async () => {
      expect(calculateStub.calledOnce).to.be.true()
      // We expect the argument to _contain_ the request payload as it should also include the default ruleset
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
    let calculateStub
    let requestPayload
    let response
    let responsePayload

    beforeEach(async () => {
      calculateStub = Sinon.stub(CalculateChargeService, 'go').returns({ response: true })

      requestPayload = { request: true }
      response = await server.inject(options(authToken, requestPayload))
      responsePayload = JSON.parse(response.payload)
    })

    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v3/wrls/calculate-charge',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    it('calls CalculateChargeService with the payload and returns its response', async () => {
      expect(calculateStub.calledOnce).to.be.true()
      // We expect the argument to _equal_ the request payload as it should not include a default ruleset
      expect(calculateStub.firstCall.firstArg).to.equal(requestPayload)
      expect(response.statusCode).to.equal(200)
      expect(responsePayload.response).to.exist()
      expect(responsePayload.response).to.be.true()
    })
  })
})
