'use strict'

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

describe('Authenticating with the API', () => {
  let server
  let authToken

  describe('When accessing a public route', () => {
    before(async () => {
      server = await deployment()
      RouteHelper.addPublicRoute(server)
    })

    it('returns a success response', async () => {
      const options = {
        method: 'GET',
        url: '/test/public'
      }

      const response = await server.inject(options)

      expect(response.statusCode).to.equal(200)
    })
  })

  describe('When accessing an /admin only route', () => {
    before(async () => {
      await DatabaseHelper.clean()
      await AuthorisedSystemHelper.addAdminSystem()

      server = await deployment()
      RouteHelper.addAdminRoute(server)
    })

    afterEach(async () => {
      Sinon.restore()
    })

    describe('but I do not have a bearer token', () => {
      it('returns a 401 error', async () => {
        const options = {
          method: 'GET',
          url: '/test/admin'
        }

        const response = await server.inject(options)

        expect(response.statusCode).to.equal(401)
      })
    })

    describe('and I have a valid bearer token', () => {
      describe("that contains a recognised 'client_id'", () => {
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

      describe.only("but it contains an unrecognised 'client_id'", () => {
        before(async () => {
          authToken = AuthorisationHelper.adminToken()
          const decodedTokenWithUnknownId = AuthorisationHelper.decodeToken(authToken)
          decodedTokenWithUnknownId.client_id = 'notfromroundhere'

          Sinon
            .stub(JsonWebToken, 'verify')
            .returns(decodedTokenWithUnknownId)
        })

        it('returns a 401 error', async () => {
          const options = {
            method: 'GET',
            url: '/test/admin',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(401)
        })
      })
    })

    describe('but I have an invalid bearer token', () => {
      before(async () => {
        authToken = AuthorisationHelper.adminToken()
      })

      describe('because it has expired', () => {
        before(async () => {
          Sinon
            .stub(JsonWebToken, 'verify')
            .throws(AuthorisationHelper.tokenExpiredError())
        })

        it('returns a 401 error', async () => {
          const options = {
            method: 'GET',
            url: '/test/admin',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(401)
        })
      })

      describe('because it was not signed by our AWS Cognito instance', () => {
        before(async () => {
          Sinon
            .stub(JsonWebToken, 'verify')
            .throws(AuthorisationHelper.tokenInvalidSignatureError())
        })

        it('returns a 401 error', async () => {
          const options = {
            method: 'GET',
            url: '/test/admin',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(401)
        })
      })
    })
  })
})
