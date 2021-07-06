// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../../../support/helpers/database.helper.js'

// Things we need to stub
import JsonWebToken from 'jsonwebtoken'

// For running our service
import { init } from '../../../../app/server.js'

// Test framework setup
const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

describe('Database controller', () => {
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.adminToken()

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

  describe('Listing table stats: GET /admin/health/database', () => {
    const options = token => {
      return {
        method: 'GET',
        url: '/admin/health/database',
        headers: { authorization: `Bearer ${token}` }
      }
    }

    it('returns stats about each table', async () => {
      const response = await server.inject(options(authToken))

      const payload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)

      // We expect at least 5 tables to exist and be returned in the results
      expect(payload.length).to.be.at.least(5)
      expect(payload[0].relname).to.exist()
    })
  })
})
