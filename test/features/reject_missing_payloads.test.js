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

const options = payload => {
  return {
    method: 'POST',
    url: '/test/post',
    payload: payload
  }
}

describe('Reject POST requests with missing payloads', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
    RouteHelper.addPublicPostRoute(server)
  })

  describe('When a POST request has a payload', () => {
    it('accepts the request', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: 'Bert & Ernie Ltd'
      }

      const response = await server.inject(options(requestPayload))

      expect(response.statusCode).to.equal(200)
    })
  })

  describe('When a POST request has an empty payload', () => {
    it('rejects the request with the appropriate error message', async () => {
      const requestPayload = ''

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(400)
      expect(responsePayload.message).to.equal('The request is invalid because it does not contain a payload.')
    })
  })

  describe('When a POST request has no payload', () => {
    it('rejects the request with the appropriate error message', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/test/post'
      })
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(400)
      expect(responsePayload.message).to.equal('The request is invalid because it does not contain a payload.')
    })
  })
})
