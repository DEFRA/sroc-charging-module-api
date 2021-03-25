'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const { RouteHelper } = require('../support/helpers')

const options = (url) => {
  return {
    method: 'GET',
    url: url
  }
}

describe("Adding a 'Notifier' instance to all requests to support logging and Errbit notifications", () => {
  let server

  // Create server before each test
  before(async () => {
    server = await deployment()
    RouteHelper.addNotifierRoute(server)
  })

  describe('When a request is made', () => {
    it("adds an instance of 'Notifier' to the request", async () => {
      const response = await server.inject(options('/test/notifier'))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload.exists).to.equal('yes')
    })
  })
})
