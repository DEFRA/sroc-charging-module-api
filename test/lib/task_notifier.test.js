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

  beforeEach(async () => {
    id = GeneralHelper.uuid4()

    airbrakeFake = { notify: Sinon.fake.resolves({ id: 1 }) }
    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#omg()', () => {
    const message = 'say what test'

    beforeEach(async () => {
      Sinon.stub(BaseNotifier.prototype, '_setNotifier').returns(airbrakeFake)
      Sinon.stub(BaseNotifier.prototype, '_setLogger').returns(pinoFake)
    })

    it("logs an 'info' message", () => {
      const expectedArgs = {
        message,
        id
      }
      const testNotifier = new TaskNotifier()
      testNotifier.omg(message, { id })

      expect(pinoFake.info.calledOnceWith(expectedArgs)).to.be.true()
    })

    it("does not send a notification to 'Errbit'", () => {
      const testNotifier = new TaskNotifier()
      testNotifier.omg(message)

      expect(airbrakeFake.notify.notCalled).to.be.true()
    })

    it("does not log an 'error' message", () => {
      const testNotifier = new TaskNotifier()
      testNotifier.omg(message)

      expect(pinoFake.error.notCalled).to.be.true()
    })
  })

  describe('#omfg()', () => {
    const message = 'hell no test'
    const data = { offTheChart: true }

    describe('when the Airbrake notification succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseNotifier.prototype, '_setLogger').returns(pinoFake)
        Sinon.stub(BaseNotifier.prototype, '_setNotifier').returns(airbrakeFake)
      })

      it("does not log an 'info' message", () => {
        const testNotifier = new TaskNotifier()
        testNotifier.omfg(message, data)

        expect(pinoFake.info.notCalled).to.be.true()
      })

      it("sends a notification to 'Errbit'", () => {
        const expectedArgs = {
          message,
          session: {
            ...data
          }
        }
        const testNotifier = new TaskNotifier()
        testNotifier.omfg(message, data)

        expect(airbrakeFake.notify.calledOnceWith(expectedArgs)).to.be.true()
      })

      it("logs an 'error' message", () => {
        const expectedArgs = {
          message,
          ...data
        }
        const testNotifier = new TaskNotifier()
        testNotifier.omfg(message, data)

        expect(pinoFake.error.calledOnceWith(expectedArgs)).to.be.true()
      })
    })

    describe('when the Airbrake notification fails', () => {
      let error

      beforeEach(async () => {
        // We specifically use a stub instead of a fake so we can then use Sinon's callsFake() function. See the test
        // below where callsFake() is used for more details.
        pinoFake = { info: Sinon.fake(), error: Sinon.stub() }
        Sinon.stub(BaseNotifier.prototype, '_setLogger').returns(pinoFake)

        error = new Error('Airbrake failed')
        airbrakeFake = { notify: Sinon.fake.resolves({ error }) }
        Sinon.stub(BaseNotifier.prototype, '_setNotifier').returns(airbrakeFake)
      })

      it("does not log an 'info' message", () => {
        const testNotifier = new TaskNotifier()
        testNotifier.omfg(message, data)

        expect(pinoFake.info.notCalled).to.be.true()
      })

      it("logs 2 'error' messages, the second containing details of the Airbrake failure", async () => {
        const expectedArgs = [
          { message, ...data },
          { message: 'TaskNotifier - Airbrake failed', error }
        ]
        const testNotifier = new TaskNotifier()
        testNotifier.omfg(message, { id })

        // We use Sinon callsFake() here in order to test our expectations. This is because Airbrake notify() actually
        // returns a promise, and it is on the calling code to handle the responses back. When we test sending the
        // Airbrake notification control immediately comes back to us whilst work continues in the background. If we
        // assert pinoFake.error.secondCall.calledWith() it always fails because the promise which calls it has not yet
        // resolved. So, callsFake() tells Sinon to call our anonymous function below that includes our assertion only
        // when pinoFake.error is called i.e. the Airbrake.notify() promise has resolved.
        pinoFake.error.callsFake(() => {
          expect(pinoFake.error.firstCall.calledWith(expectedArgs[0]))
          expect(pinoFake.error.secondCall.calledWith(expectedArgs[1]))
        })
      })
    })

    describe('when the Airbrake notification errors', () => {
      let error

      beforeEach(async () => {
        pinoFake = { info: Sinon.fake(), error: Sinon.stub() }
        Sinon.stub(BaseNotifier.prototype, '_setLogger').returns(pinoFake)

        error = new Error('Airbrake errored')
        airbrakeFake = { notify: Sinon.fake.resolves({ error }) }
        Sinon.stub(BaseNotifier.prototype, '_setNotifier').returns(airbrakeFake)
      })

      it("does not log an 'info' message", () => {
        const testNotifier = new TaskNotifier()
        testNotifier.omfg(message, data)

        expect(pinoFake.info.notCalled).to.be.true()
      })

      it("logs 2 'error' messages, the second containing details of the Airbrake errors", async () => {
        const expectedArgs = [
          { message, ...data },
          { message: 'TaskNotifier - Airbrake failed', error }
        ]
        const testNotifier = new TaskNotifier()
        testNotifier.omfg(message, { id })

        pinoFake.error.callsFake(() => {
          expect(pinoFake.error.firstCall.calledWith(expectedArgs[0]))
          expect(pinoFake.error.secondCall.calledWith(expectedArgs[1]))
        })
      })
    })
  })
})
