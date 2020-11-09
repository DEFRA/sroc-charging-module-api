'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { AuthorisationHelper, AuthorisedSystemHelper, RulesServiceHelper, DatabaseHelper } = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

const { SimpleFixtures, S127S130Fixtures, S126ProrataCreditFixtures } = require('../support/fixtures/wrls/calculate_charge')

describe('Calculate charge controller: POST /v2/{regime}/calculate_charge', () => {
  let server

  // Create auth token for stubbing authorisation
  const nonAdminClientId = 'k7ehotrs1fqer7hoaslv7ilmr'
  const authToken = AuthorisationHelper.nonAdminToken(nonAdminClientId)

  before(async () => {
    // Create server before tests
    server = await deployment()
  })

  beforeEach(async () => {
    // Stub authorisation
    await AuthorisedSystemHelper.addSystem(nonAdminClientId, 'wrls')
    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  afterEach(async () => {
    Nock.cleanAll()
    Sinon.restore()
    await DatabaseHelper.clean()
  })

  it('handles example 1 (simple case)', async () => {
    await testFixtures(SimpleFixtures, authToken, server)
  })

  it('handles example 2 (includes S127 and S130)', async () => {
    await testFixtures(S127S130Fixtures, authToken, server)
  })

  it('handles example 3 (S126, a pro-rata calculation and a credit)', async () => {
    await testFixtures(S126ProrataCreditFixtures, authToken, server)
  })
})

async function testFixtures (fixture, authToken, server) {
  const {
    rulesServiceRequest,
    rulesServiceResponse,
    calculateChargeRequest,
    calculateChargeResponse
  } = S126ProrataCreditFixtures

  mockRulesService(rulesServiceRequest, rulesServiceResponse)

  const options = calculateChargeOptions(authToken, calculateChargeRequest)
  const response = await server.inject(options)
  const payload = JSON.parse(response.payload)

  expect(response.statusCode).to.equal(200)
  expect(payload).to.equal(calculateChargeResponse)
}
function mockRulesService (request, response) {
  Nock(RulesServiceHelper.url, { encodedQueryParams: true })
    .post('/TEST_WRLS_SRoC_RuleApp/WRLS_SRoC_RuleSet_2021_22', request)
    .reply(200, response)
}

const calculateChargeOptions = (authToken, payload) => {
  return {
    method: 'POST',
    url: '/v2/srocWrls/calculate_charge',
    headers: { authorization: `Bearer ${authToken}` },
    payload
  }
}
