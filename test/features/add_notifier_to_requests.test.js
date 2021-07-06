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

const options = (url) => {
  return {
    method: 'GET',
    url: url
  }
}

describe("Adding a 'RequestNotifierLib' instance to all requests to support logging and Errbit notifications", () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
    RouteHelper.addNotifierRoute(server)
  })

  describe('When a request is made', () => {
    it("adds an instance of 'RequestNotifierLib' to the request", async () => {
      const response = await server.inject(options('/test/notifier'))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(responsePayload.exists).to.equal('yes')
    })
  })
})
