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
const AuthorisationHelper = require('../../../support/helpers/authorisation.helper.js')
const AuthorisedSystemHelper = require('../../../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const Airbrake = require('@airbrake/node')

describe('Airbrake controller: GET /status/airbrake', () => {
  let server
  const authToken = AuthorisationHelper.adminToken()

  before(async () => {
    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    await AuthorisedSystemHelper.addAdminSystem()
  })

  after(async () => {
    Sinon.restore()
  })

  it('returns a 500 error', async () => {
    const options = {
      method: 'GET',
      url: '/admin/health/airbrake',
      headers: { authorization: `Bearer ${authToken}` }
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(500)
  })

  it('causes Airbrake to send a notification', async () => {
    const options = {
      method: 'GET',
      url: '/admin/health/airbrake',
      headers: { authorization: `Bearer ${authToken}` }
    }

    // We stub Airbrake in the test as currently this is the only test using it
    const airbrakeStub = Sinon
      .stub(Airbrake.Notifier.prototype, 'notify')
      .resolves({ id: 1 })

    await server.inject(options)

    expect(airbrakeStub.called).to.equal(true)

    airbrakeStub.restore()
  })
})
