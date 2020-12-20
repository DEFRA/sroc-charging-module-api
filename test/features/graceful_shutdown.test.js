'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// The main inspiration for these tests was taken from https://stackoverflow.com/a/40909092/6117745
// However, the server module it is written against exposes its methods in such a way they are easy to stub/spy on.
// We've had no such luck with Hapi. So though we can't get our expectations to work we can see with well placed
// console logs that when these tests are run the behaviour we expect to see does happen.
describe('Gracefully shuts down when asked to terminate', () => {
  let server

  before(async () => {
    server = await deployment()

    Sinon.stub(process, 'exit')

    // See comments above tests for reason why these are commented out
    // Sinon.spy(server, 'stop')
    // Sinon.spy(server.logger, 'info')
  })

  afterEach(async () => {
    Sinon.resetHistory()
    Sinon.restore()
  })

  describe("When a 'SIGTERM' signal is sent", () => {
    // We have to admit defeat on this one. We currently cannot figure out how to attach a spy to the server.close()
    // method in Hapi. We've left the test here for documentation purposes and in case we have inspiration at a later
    // date.
    it.skip("calls 'server.stop()' to allow existing requests time to finish", async () => {
      process.once('SIGTERM', () => {
        expect(server.stop.calledOnce).to.be.true()
      })
      process.kill(process.pid, 'SIGTERM')
    })

    // We also have to admit defeat on this one. We currently cannot figure out how to attach a spy to the
    // server.logger instance hapi-pino attaches. We've left the test here for documentation purposes and in case we
    // have inspiration at a later date.
    it.skip("uses 'server.logger' to log the service is finished", async () => {
      process.once('SIGTERM', () => {
        expect(server.logger.info.calledOnce).to.be.true()
      })
      process.kill(process.pid, 'SIGTERM')
    })
  })
})
