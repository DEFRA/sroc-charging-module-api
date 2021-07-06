// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Things we need to stub
import TestConfig from '../../config/test.config.js'

// For running our service
import { init } from '../../app/server.js'

// Test framework setup
const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Only output the log when running unit tests if configured to', () => {
  let server

  beforeEach(async () => {
    server = await init()
  })

  afterEach(async () => {
    Sinon.restore()
  })

  // TODO: Understand why this test only works when run in isolation or as the
  // very first test run.
  describe.skip('When logging in test is enabled', () => {
    before(async () => {
      // Ensure config returns false when the value is requested rather than what is currently in our .env file
      Sinon.replace(TestConfig, 'logInTest', true)
    })

    it('calls the Pino logger when log calls are made', async () => {
      // A call to Hapi server.log() will result in a call to the Pino instance hapi-pino decorates the server object
      // with.
      const loggerSpy = Sinon.spy(server.logger, 'info')

      server.log(['INFO'], 'Testing 1-2-3')

      expect(loggerSpy.called).to.equal(true)

      loggerSpy.resetHistory()
      loggerSpy.restore()
    })
  })

  describe('When logging in test is disabled', () => {
    before(async () => {
      // Ensure config returns false when the value is requested rather than what is currently in our .env file
      Sinon.replace(TestConfig, 'logInTest', false)
    })

    it('does not call the Pino logger when log calls are made', async () => {
      // A call to Hapi server.log() will result in a call to the Pino instance hapi-pino decorates the server object
      // with. That is if logging is enabled. If it isn't then the call goes no further and nothing is logged
      const loggerSpy = Sinon.spy(server.logger, 'info')

      server.log(['INFO'], 'Testing 1-2-3')

      expect(loggerSpy.called).to.equal(false)

      loggerSpy.resetHistory()
      loggerSpy.restore()
    })
  })
})
