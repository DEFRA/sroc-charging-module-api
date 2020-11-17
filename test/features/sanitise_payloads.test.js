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

const options = payload => {
  return {
    method: 'POST',
    url: '/test/post',
    payload: payload
  }
}

describe('Sanitizing requests to the API', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await deployment()
    RouteHelper.addPublicPostRoute(server)
  })

  describe.only('When a POST request contains a mix of dangerous and HTML content', () => {
    it('sanitizes the request', async () => {
      const requestPayload = {
        reference: 'BESESAME001&',
        codes: ['AB1', 'BD2', 'CD3<>'],
        description: '<script>alert()</script>',
        preferences: [true, false, true],
        details: {
          active: false,
          orders: [
            {
              id: '123',
              orderDate: '2012-04-23T18:25:43.511Z',
              lines: [
                { pos: 1, picked: true, item: 'widget<' },
                { pos: 2, picked: false, item: '<script>alert()</script>' }
              ]
            }
          ]
        }
      }

      const expectedResponse = {
        reference: 'BESESAME001&',
        codes: ['AB1', 'BD2', 'CD3<>'],
        preferences: [true, false, true],
        details: {
          active: false,
          orders: [
            {
              id: '123',
              orderDate: '2012-04-23T18:25:43.511Z',
              lines: [
                { pos: 1, picked: true, item: 'widget<' },
                { pos: 2, picked: false }
              ]
            }
          ]
        }
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload).to.equal(expectedResponse)
    })
  })
})
