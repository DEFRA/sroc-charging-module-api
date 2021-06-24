// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const { RouteHelper } = require('../support/helpers')

describe('Not Supported controller', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
    RouteHelper.addNotSupportedRoute(server)
  })

  it('returns a 410 error', async () => {
    const options = {
      method: 'GET',
      url: '/test/not-supported'
    }

    const response = await server.inject(options)

    expect(response.statusCode).to.equal(410)
  })
})
