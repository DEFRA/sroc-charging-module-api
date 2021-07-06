// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'

// Test helpers
import RouteHelper from '../support/helpers/route.helper.js'

// For running our service
import { init } from '../../app/server.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
