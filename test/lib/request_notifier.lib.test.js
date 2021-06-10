'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { RequestNotifierLib } = require('../../app/lib')

describe('RequestNotifierLib class', () => {
  const id = '1234567890'
  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    airbrakeFake = { notify: Sinon.fake.resolves({ id: 1 }), flush: Sinon.fake() }
    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a log entry is made', () => {
    const message = 'say what test'

    it("logs an 'info' message", () => {
      const expectedArgs = {
        message,
        req: {
          id: id
        }
      }
      const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
      testNotifier.omg(message)

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
          ...data,
          req: {
            id
          }
        }
      }
      const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
      testNotifier.omfg(message, data)

      expect(airbrakeFake.notify.calledOnceWith(expectedArgs)).to.be.true()
    })
  })
})
