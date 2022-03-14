'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const AuthorisationHelper = require('../support/helpers/authorisation.helper.js')
const AuthorisedSystemHelper = require('../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const RegimeHelper = require('../support/helpers/regime.helper.js')
const RouteHelper = require('../support/helpers/route.helper.js')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Authorisation with the API', () => {
  let server
  let authToken
  const nonAdminClientId = '1234546789'
  const inactiveAdminClientId = 'admin12345'
  const inactiveSystemClientId = 'system12345'

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    await AuthorisedSystemHelper.addAdminSystem()
    await AuthorisedSystemHelper.addAdminSystem(inactiveAdminClientId, 'inactiveadmin', 'inactive')

    const regime = await RegimeHelper.addRegime('wrls', 'Water')
    await AuthorisedSystemHelper.addSystem(nonAdminClientId, 'system', [regime])
    await AuthorisedSystemHelper.addSystem(inactiveSystemClientId, 'inactivesystem', [regime], 'inactive')

    RouteHelper.addAdminRoute(server)
    RouteHelper.addSystemGetRoute(server)
    RouteHelper.addPublicRoute(server)
  })

  describe('When accessing an /admin only route', () => {
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

    describe("but my status is not 'active'", () => {
      before(async () => {
        authToken = AuthorisationHelper.nonAdminToken(inactiveAdminClientId)

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

  describe('When accessing a /{regimeSlug}/action (system) route', () => {
    afterEach(async () => {
      Sinon.restore()
    })

    describe('I am an admin client', () => {
      describe("and my status is 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.adminToken()

          Sinon
            .stub(JsonWebToken, 'verify')
            .returns(AuthorisationHelper.decodeToken(authToken))
        })

        it('returns a success response', async () => {
          const options = {
            method: 'GET',
            url: '/test/wrls/system',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })

      describe("but my status is not 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.nonAdminToken(inactiveAdminClientId)

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

    describe('I am a system client', () => {
      describe("and my status is 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.nonAdminToken(nonAdminClientId)

          Sinon
            .stub(JsonWebToken, 'verify')
            .returns(AuthorisationHelper.decodeToken(authToken))
        })

        it('returns a success response', async () => {
          const options = {
            method: 'GET',
            url: '/test/wrls/system',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })

      describe("but my status is not 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.nonAdminToken(inactiveSystemClientId)

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

  describe('When accessing a public route', () => {
    afterEach(async () => {
      Sinon.restore()
    })

    describe('I am an admin client', () => {
      describe("and my status is 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.adminToken()

          Sinon
            .stub(JsonWebToken, 'verify')
            .returns(AuthorisationHelper.decodeToken(authToken))
        })

        it('returns a success response', async () => {
          const options = {
            method: 'GET',
            url: '/test/public',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })

      describe("but my status is not 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.nonAdminToken(inactiveAdminClientId)

          Sinon
            .stub(JsonWebToken, 'verify')
            .returns(AuthorisationHelper.decodeToken(authToken))
        })

        it('returns a success response', async () => {
          const options = {
            method: 'GET',
            url: '/test/public',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })
    })

    describe('I am a system client', () => {
      describe("and my status is 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.nonAdminToken(nonAdminClientId)

          Sinon
            .stub(JsonWebToken, 'verify')
            .returns(AuthorisationHelper.decodeToken(authToken))
        })

        it('returns a success response', async () => {
          const options = {
            method: 'GET',
            url: '/test/public',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })

      describe("but my status is not 'active'", () => {
        before(async () => {
          authToken = AuthorisationHelper.nonAdminToken(inactiveSystemClientId)

          Sinon
            .stub(JsonWebToken, 'verify')
            .returns(AuthorisationHelper.decodeToken(authToken))
        })

        it('returns a success response', async () => {
          const options = {
            method: 'GET',
            url: '/test/public',
            headers: { authorization: `Bearer ${authToken}` }
          }

          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })
    })

    describe('and I am neither an admin or system client', () => {
      it('returns a success response', async () => {
        const options = {
          method: 'GET',
          url: '/test/public'
        }

        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
      })
    })
  })
})
