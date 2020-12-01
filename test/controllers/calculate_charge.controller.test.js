'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  DatabaseHelper,
  RegimeHelper,
  RulesServiceHelper
} = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

const { SimpleFixtures, S127S130Fixtures, S126ProrataCreditFixtures } = require('../support/fixtures/wrls/calculate_charge')

describe('Calculate charge controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    server = await deployment()
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
  })

  afterEach(async () => {
    Nock.cleanAll()
  })

  describe('Calculate a charge: POST /v2/{regimeId}/calculate-charge', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/calculate-charge',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    it('handles example 1 (simple case)', async () => {
      mockRulesService(SimpleFixtures.rulesServiceRequest, SimpleFixtures.rulesServiceResponse)

      const response = await server.inject(options(authToken, SimpleFixtures.calculateChargeRequest))
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(payload).to.equal(SimpleFixtures.calculateChargeResponse)
    })

    it('handles example 2 (includes S127 and S130)', async () => {
      mockRulesService(S127S130Fixtures.rulesServiceRequest, S127S130Fixtures.rulesServiceResponse)

      const response = await server.inject(options(authToken, S127S130Fixtures.calculateChargeRequest))
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(payload).to.equal(S127S130Fixtures.calculateChargeResponse)
    })

    it('handles example 3 (S126, a pro-rata calculation and a credit)', async () => {
      mockRulesService(S126ProrataCreditFixtures.rulesServiceRequest, S126ProrataCreditFixtures.rulesServiceResponse)

      const response = await server.inject(options(authToken, S126ProrataCreditFixtures.calculateChargeRequest))
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(payload).to.equal(S126ProrataCreditFixtures.calculateChargeResponse)
    })
  })
})

function mockRulesService (request, response) {
  Nock(RulesServiceHelper.url, { encodedQueryParams: true })
    .post('/TEST_WRLS_SRoC_RuleApp/WRLS_SRoC_RuleSet_2021_22', request)
    .reply(200, response)
}
