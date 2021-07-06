// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../../support/helpers/database.helper.js'

// Things we need to stub
import JsonWebToken from 'jsonwebtoken'
import SendCustomerFileService from '../../app/services/send_customer_file.service.js'

// For running our service
import { init } from '../../../app/server.js'

// Test framework setup
const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Customers controller', () => {
  let server
  let authToken
  let serviceStub

  before(async () => {
    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))

    serviceStub = Sinon
      .stub(SendCustomerFileService, 'go')
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    await AuthorisedSystemHelper.addAdminSystem()
  })

  afterEach(async () => {
    serviceStub.restore()
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Sending customer files: PATCH /admin/{regimeId}/customers', () => {
    const options = token => {
      return {
        method: 'PATCH',
        url: '/admin/wrls/customers',
        headers: { authorization: `Bearer ${token}` }
      }
    }

    it('returns a 204 response', async () => {
      const response = await server.inject(options(authToken))

      expect(response.statusCode).to.equal(204)
    })

    it('calls GenerateCustomerFileService', async () => {
      await server.inject(options(authToken))

      expect(serviceStub.calledOnce).to.be.true()
    })
  })

  describe('Show customer files: GET /admin/{regimeId}/customers', () => {
    const options = token => {
      return {
        method: 'GET',
        url: '/admin/wrls/customers',
        headers: { authorization: `Bearer ${token}` }
      }
    }

    it('returns success status 204', async () => {
      const response = await server.inject(options(authToken))

      expect(response.statusCode).to.equal(204)
    })
  })
})
