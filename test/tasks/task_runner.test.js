// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { TaskRunner } = require('../../app/tasks')

// Things we need to stub
const { CustomerFilesTask } = require('../../app/tasks')

describe('Task Runner', () => {
  let taskStub
  let notifierFake

  beforeEach(async () => {
    // We need a recognised task for the tests but we don't actually want to execute it
    taskStub = Sinon.stub(CustomerFilesTask, 'go')

    // Our TaskRunner calls this when all the work is done, but if left unstubbed it also kills the tests!
    Sinon.stub(process, 'exit')

    // We stub what _notifier() returns to kill console logs messages messing up the test output. Once `TaskNotifierLib`
    // is merged in we can stub it instead.
    // Also, we use a stub rather than a fake for `flush()`. This allows us to then use Sinon's callsFake() function in
    // the test that confirms it was called
    notifierFake = { omg: Sinon.fake(), omfg: Sinon.fake(), flush: Sinon.stub() }
    Sinon.stub(TaskRunner, '_notifier').returns(notifierFake)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When passed a valid classname', () => {
    describe('in properly formatted camel case', () => {
      it('can determine the task to run', () => {
        TaskRunner.go('CustomerFilesTask')

        expect(taskStub.called).to.be.true()
      })
    })

    describe("in improperly formatted 'cat walked over the keyboard' case", () => {
      it('can determine the task to run', () => {
        TaskRunner.go('cusTomerFilestaSk')

        expect(taskStub.called).to.be.true()
      })
    })

    it('flushes the notifier to ensure all errors are sent to Errbit', () => {
      TaskRunner.go('CustomerFilesTask')

      // We have 2 options for checking `flush()` gets called. If we make the test async and add 'await' to the
      // TaskRunner.go() call we can assert that flush() was called. But when we use the TaskRunner for real we won't do
      // this. So, the alternate is to use Sinons's callsFake() method which allows us to make the assertion in a
      // callback which only gets fired when flush() is called (if that never happens the test will simply timeout and
      // error). This matches how TaskRunner is actually called which is why its the option we went for
      notifierFake.flush.callsFake(() => {
        expect(notifierFake.flush.called).to.be.true()
      })
    })
  })

  describe('When passed an invalid classname', () => {
    it('throws an error', async () => {
      const err = await expect(TaskRunner.go('FooTask')).to.reject()

      expect(err).to.be.an.error()
      expect(err.message).to.equal("Unknown class name 'footask' passed to task runner")
      expect(taskStub.called).to.be.false()
    })
  })
})
