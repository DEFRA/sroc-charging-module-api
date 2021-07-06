// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Thing under test
import BoomNotifierLib from '../../app/lib/boom_notifier.lib.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('BoomNotifierLib class', () => {
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
      const testNotifier = new BoomNotifierLib(id, pinoFake, airbrakeFake)

      // We wrap the call in this assertion so the thrown error doesn't cause the test to fail
      expect(() => testNotifier.omfg(message, data)).to.throw()
      expect(airbrakeFake.notify.calledOnceWith(expectedArgs)).to.be.true()
    })

    it('throws a Boom error with the correct message and data', async () => {
      const testNotifier = new BoomNotifierLib(id, pinoFake, airbrakeFake)

      expect(() => testNotifier.omfg(message, data)).to.throw(Error, { message, data })
    })
  })
})
