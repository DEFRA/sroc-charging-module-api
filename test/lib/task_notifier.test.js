'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Things we need to stub
const { BaseNotifier } = require('../../app/lib')

// Thing under test
const { TaskNotifier } = require('../../app/lib')

describe('TaskNotifier class', () => {
  let id
  let airbrakeFake
  let pinoFake
  let notifier

  beforeEach(async () => {
    id = GeneralHelper.uuid4()

    airbrakeFake = Sinon.fake.resolves({ id: 1 })
    Sinon.stub(BaseNotifier.prototype, '_setNotifier').returns(airbrakeFake)

    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
    Sinon.stub(BaseNotifier.prototype, '_setLogger').returns(pinoFake)

    notifier = new TaskNotifier()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#omg()', () => {
    const message = 'say what test'

    it("logs an 'info' message", () => {
      const expectedArgs = {
        message,
        id
      }
      notifier.omg(message, { id })

      expect(pinoFake.info.calledOnceWith(expectedArgs)).to.be.true()
    })

    it("does not send a notification to 'Errbit'", () => {
      notifier.omg(message)

      expect(airbrakeFake.notCalled).to.be.true()
    })

    it("does not log an 'error' message", () => {
      notifier.omg(message)

      expect(pinoFake.error.notCalled).to.be.true()
    })
  })

  describe('#omfg()', () => {
    const message = 'hell no test'
    const data = { offTheChart: true }

    it("does not log an 'info' message", () => {
      notifier.omfg(message, data)

      expect(pinoFake.info.notCalled).to.be.true()
    })

    it("sends a notification to 'Errbit'", () => {
      const expectedArgs = {
        message,
        session: {
          ...data
        }
      }
      notifier.omfg(message, data)

      expect(airbrakeFake.calledOnceWith(expectedArgs)).to.be.true()
    })

    it("logs an 'error' message", () => {
      const expectedArgs = {
        message,
        ...data
      }
      notifier.omfg(message, data)

      expect(pinoFake.error.calledOnceWith(expectedArgs)).to.be.true()
    })
  })
})
