// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { AuthorisationHelper, AuthorisedSystemHelper, DatabaseHelper, RouteHelper } = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Authorisation with the API', () => {
  let server
  let authToken
  const nonAdminClientId = 'k7ehotrs1fqer7hoaslv7ilmr'

  describe('When accessing an /admin only route', () => {
    before(async () => {
      await DatabaseHelper.clean()
      await AuthorisedSystemHelper.addAdminSystem()
      await AuthorisedSystemHelper.addSystem(nonAdminClientId, 'wrls')

      server = await deployment()
      RouteHelper.addAdminRoute(server)
    })

    afterEach(async () => {
      Sinon.restore()
    })

    describe('and I am an admin client', () => {
      before(async () => {
        authToken = AuthorisationHelper.adminToken()

        Sinon
          .stub(JsonWebToken, 'verify')
          .returns(AuthorisationHelper.decodeToken(authToken))
      })

      it('returns a success response', async () => {
        const options = {
          method: 'GET',
          url: '/test/admin',
          headers: { authorization: `Bearer ${authToken}` }
        }

        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
      })
    })

    describe('but I am not an admin client', () => {
      before(async () => {
        authToken = AuthorisationHelper.nonAdminToken(nonAdminClientId)

        Sinon
          .stub(JsonWebToken, 'verify')
          .returns(AuthorisationHelper.decodeToken(authToken))
      })

      it('returns a 403 response', async () => {
        const options = {
          method: 'GET',
          url: '/test/admin',
          headers: { authorization: `Bearer ${authToken}` }
        }

        const response = await server.inject(options)

        expect(response.statusCode).to.equal(403)
      })
    })
  })
})
