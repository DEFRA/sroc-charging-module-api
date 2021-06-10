'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const { BaseNotifierLib } = require('../../app/lib')

// Thing under test
const { TaskNotifierLib } = require('../../app/lib')

describe('TaskNotifierLib class', () => {
  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    airbrakeFake = { notify: Sinon.fake.resolves({ id: 1 }), flush: Sinon.fake() }
    Sinon.stub(BaseNotifierLib.prototype, '_setNotifier').returns(airbrakeFake)

    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
    Sinon.stub(BaseNotifierLib.prototype, '_setLogger').returns(pinoFake)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a log entry is made', () => {
    const id = '1234567890'
    const message = 'say what test'

    it('formats it as expected', () => {
      const expectedArgs = {
        message,
        id
      }
      const testNotifier = new TaskNotifierLib()
      testNotifier.omg(message, { id })

      expect(pinoFake.info.calledOnceWith(expectedArgs)).to.be.true()
    })
  })

  describe('when an airbrake notification is sent', () => {
    const message = 'hell no test'
    const data = { offTheChart: true }

    it('formats it as expected', () => {
      const expectedArgs = {
        message,
        session: {
          ...data
        }
      }
      const testNotifier = new TaskNotifierLib()
      testNotifier.omfg(message, data)

      expect(airbrakeFake.notify.calledOnceWith(expectedArgs)).to.be.true()
    })
  })
})
