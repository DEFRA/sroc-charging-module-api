'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { DataExportTask } = require('../../app/tasks')

// Things we need to stub
const { ExportDataFiles } = require('../../app/services')

describe('Customer Files Task', () => {
  let notifierFake
  let serviceStub

  beforeEach(async () => {
    notifierFake = { omg: Sinon.fake(), omfg: Sinon.fake() }

    serviceStub = Sinon.stub(ExportDataFiles, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When the task is run', () => {
    it("calls the 'ExportDataFiles'", async () => {
      await DataExportTask.go(notifierFake)

      expect(serviceStub.calledOnce).to.be.true()
    })
  })
})
