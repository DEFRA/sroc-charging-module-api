'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { Notifier } = require('../../app/lib')

describe('Notifier class', () => {
  let loggerFake
  let notifyFake
  let notifier

  beforeEach(async () => {
    loggerFake = {
      info: Sinon.fake(),
      error: Sinon.fake()
    }
    notifyFake = Sinon.fake()

    notifier = new Notifier(loggerFake, notifyFake)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#omg()', () => {
    const message = 'say what test'

    it("logs an 'info' message", () => {
      notifier.omg(message)

      expect(loggerFake.info.calledOnceWith(message)).to.be.true()
    })

    it("does not send a notification to 'Errbit'", () => {
      notifier.omg(message)

      expect(notifyFake.notCalled).to.be.true()
    })

    it("does not log an 'error' message", () => {
      notifier.omg(message)

      expect(loggerFake.error.notCalled).to.be.true()
    })
  })

  describe('#omfg()', () => {
    const message = 'hell no test'
    const data = { offTheChart: true }

    it("does not log an 'info' message", () => {
      notifier.omfg(message, data)

      expect(loggerFake.info.notCalled).to.be.true()
    })

    it("sends a notification to 'Errbit'", () => {
      notifier.omfg(message, data)

      expect(notifyFake.calledOnceWith(message, data)).to.be.true()
    })

    it("logs an 'error' message", () => {
      notifier.omfg(message, data)

      expect(loggerFake.error.calledOnceWith({ message, data })).to.be.true()
    })
  })
})
