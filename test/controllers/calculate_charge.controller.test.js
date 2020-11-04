'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { AuthorisationHelper } = require('../support/helpers')
const { RulesServiceHelper } = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

const rulesServiceRequestFixtures = [
  require('../support/fixtures/wrls/calculate_charge/rules_service_request_1.json'),
  require('../support/fixtures/wrls/calculate_charge/rules_service_request_2.json'),
  require('../support/fixtures/wrls/calculate_charge/rules_service_request_3.json')
]

const rulesServiceResponseFixtures = [
  require('../support/fixtures/wrls/calculate_charge/rules_service_response_1.json'),
  require('../support/fixtures/wrls/calculate_charge/rules_service_response_2.json'),
  require('../support/fixtures/wrls/calculate_charge/rules_service_response_3.json')
]

const calculateChargeRequestFixtures = [
  require('../support/fixtures/wrls/calculate_charge/calculate_charge_request_1.json'),
  require('../support/fixtures/wrls/calculate_charge/calculate_charge_request_2.json'),
  require('../support/fixtures/wrls/calculate_charge/calculate_charge_request_3.json')
]

const calculateChargeResponseFixtures = [
  require('../support/fixtures/wrls/calculate_charge/calculate_charge_response_1.json'),
  require('../support/fixtures/wrls/calculate_charge/calculate_charge_response_2.json'),
  require('../support/fixtures/wrls/calculate_charge/calculate_charge_response_3.json')
]

// TODO: Mock call to rules service

describe('Calculate charge controller: POST /v2/{regime}/calculate_charge', () => {
  let server

  // Create auth token for stubbing authorisation

  /**
   * TODO: This only works with a non-admin token if the preceding Airbrake tests are skipped; I suspect something
   * needs to be done to tear them down properly. This will be looked at in a separate PR; for the time being this
   * test uses an admin token so it doesn't error.
   */
  const nonAdminClientId = 'k7ehotrs1fqer7hoaslv7ilmr'
  const authToken = AuthorisationHelper.adminToken(nonAdminClientId)

  before(async () => {
    // Create server before each test
    server = await deployment()

    // Stub authorisation
    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  afterEach(async () => {
    Nock.cleanAll()
  })

  it('handles example 1 (simple case)', async () => {
    mockRulesService(rulesServiceRequestFixtures[0], rulesServiceResponseFixtures[0])

    const options = calculateChargeOptions(authToken, calculateChargeRequestFixtures[0])
    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(200)
    expect(payload).to.equal(calculateChargeResponseFixtures[0])
  })

  it('handles example 2 (includes S127 and S130)', async () => {
    mockRulesService(rulesServiceRequestFixtures[1], rulesServiceResponseFixtures[1])

    const options = calculateChargeOptions(authToken, calculateChargeRequestFixtures[1])
    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(200)
    expect(payload).to.equal(calculateChargeResponseFixtures[1])
  })

  it('handles example 3 (S126, a pro-rata calculation and a credit)', async () => {
    mockRulesService(rulesServiceRequestFixtures[2], rulesServiceResponseFixtures[2])

    const options = calculateChargeOptions(authToken, calculateChargeRequestFixtures[2])
    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(200)
    expect(payload).to.equal(calculateChargeResponseFixtures[2])
  })
})

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
