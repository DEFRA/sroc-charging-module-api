'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { AuthorisationHelper } = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

// Fixtures to test
const requestFixture = require('../support/fixtures/wrls/calculate_charge_request_1.json')
const responseFixture = require('../support/fixtures/wrls/calculate_charge_response_1.json')

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

  it('returns the correct response from the rules service', async () => {
    const options = {
      method: 'POST',
      url: '/v2/srocWrls/calculate_charge',
      headers: { authorization: `Bearer ${authToken}` },
      payload: requestFixture
    }

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(200)
    expect(payload).to.equal(responseFixture)
  })
})
