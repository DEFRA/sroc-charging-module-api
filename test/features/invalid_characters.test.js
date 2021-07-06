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

describe('Reject requests with invalid characters', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
    RouteHelper.addPublicPostRoute(server)
  })

  describe('When a payload does not include an invalid character', () => {
    it('accepts the request', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: 'Bert & Ernie Ltd'
      }

      const response = await server.inject(options(requestPayload))

      expect(response.statusCode).to.equal(200)
    })
  })

  describe('When a payload does include an invalid character', () => {
    it('rejects the request with the appropriate error message', async () => {
      const requestPayload = {
        reference: 'BESESAME001',
        customerName: 'Bert & Ernie Ltd?'
      }

      const response = await server.inject(options(requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(422)
      expect(responsePayload.message).to.equal('We cannot accept any request that contains the following characters: ? £ ≤ ≥')
    })
  })
})
