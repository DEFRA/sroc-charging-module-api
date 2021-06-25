'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const { RouteHelper } = require('../support/helpers')

const options = (url) => {
  return {
    method: 'GET',
    url: url
  }
}

describe('Routing requests to the API', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
    RouteHelper.addPublicRoute(server)
  })

  describe('When a request path has a trailing slash', () => {
    it('still matches the route', async () => {
      const response = await server.inject(options('/test/public/'))

      expect(response.statusCode).to.equal(200)
    })
  })

  describe('When a request path uses a different case', () => {
    it('still matches the route', async () => {
      const response = await server.inject(options('/test/PUBLIC'))

      expect(response.statusCode).to.equal(200)
    })
  })
})
