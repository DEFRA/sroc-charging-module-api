'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const RouteHelper = require('../support/helpers/route.helper.js')

const requestOptions = {
  method: 'GET',
  url: '/test/public'
}

const appDeprecationOptions = options => {
  return {
    app: {
      deprecation: options
    }
  }
}

describe('Add deprecated route info', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  describe('When a request is made', () => {
    describe('if the route is marked as deprecated', () => {
      describe('and the route has a successor', () => {
        const deprecation = appDeprecationOptions({
          successor: '/replacement-path'
        })

        it('sets the `deprecation` and `link` headers', async () => {
          await RouteHelper.addPublicRoute(server, deprecation)

          const response = await server.inject(requestOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.headers.deprecation).to.be.true()
          expect(response.headers.link).to.equal('</replacement-path>; rel="successor-version"')
        })
      })

      describe('and the route does not have a successor', () => {
        const deprecation = appDeprecationOptions({ })

        it('sets the `deprecation` header only', async () => {
          await RouteHelper.addPublicRoute(server, deprecation)

          const response = await server.inject(requestOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.headers.deprecation).to.be.true()
          expect(response.headers.link).to.not.exist()
        })
      })
    })

    describe('if the route is not marked as deprecated', () => {
      it('sets neither the `deprecation` nor the `link` header', async () => {
        await RouteHelper.addPublicRoute(server)

        const response = await server.inject(requestOptions)

        expect(response.statusCode).to.equal(200)
        expect(response.headers.deprecation).to.not.exist()
        expect(response.headers.link).to.not.exist()
      })
    })
  })
})
