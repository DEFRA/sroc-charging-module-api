// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../../../support/helpers/database.helper.js'

// Things we need to stub
import Airbrake from '@airbrake/node'
import JsonWebToken from 'jsonwebtoken'

// For running our service
import { init } from '../../../../app/server.js'

// Test framework setup
const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

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
