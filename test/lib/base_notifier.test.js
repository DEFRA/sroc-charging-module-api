'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { BaseNotifier } = require('../../app/lib')

describe('BaseNotifier class', () => {
  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    // We use these fakes and stubs to avoid Pino or Airbrake being instantiated during the test
    airbrakeFake = Sinon.fake.resolves({ id: 1 })
    Sinon.stub(BaseNotifier.prototype, '_setNotifier').returns(airbrakeFake)

    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
    Sinon.stub(BaseNotifier.prototype, '_setLogger').returns(pinoFake)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#_formatLogPacket()', () => {
    it("throws an error if '_formatLogPacket' is not overridden", async () => {
      const testNotifier = new BaseNotifier()

      expect(() => testNotifier.omg('Oops')).to.throw("Extending class must implement '_formatLogPacket()'")
    })
  })

  describe('#_formatNotifyPacket()', () => {
    beforeEach(async () => {
      // We need to stub _formatLogPacket in this test else we don't get to `_formatNotifyPacket()` because of the error
      // `_formatLogPacket()` will throw.
      Sinon.stub(BaseNotifier.prototype, '_formatLogPacket').callsFake(() => {
        return { message: 'Boom!' }
      })
    })

    it("throws an error if '_formatNotifyPacket' is not overridden", async () => {
      const testNotifier = new BaseNotifier()

      expect(() => testNotifier.omfg('Oops')).to.throw("Extending class must implement '_formatNotifyPacket()'")
    })
  })
})
