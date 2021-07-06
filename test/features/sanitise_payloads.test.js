// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import RouteHelper from '../support/helpers/route.helper.js'

// For running our service
import { init } from '../../app/server.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
  beforeEach(async () => {
    server = await init()
    RouteHelper.addPublicPostRoute(server)
  })

  describe('When a POST request contains a mix of dangerous and HTML content', () => {
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
