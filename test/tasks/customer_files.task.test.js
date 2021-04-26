'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { CustomerFilesTask } = require('../../app/tasks')

// Things we need to stub
const { RegimeModel } = require('../../app/models')
const { SendCustomerFileService } = require('../../app/services')

describe('Customer Files Task', () => {
  let notifierFake
  let serviceStub
  const regimes = [
    { slug: 'wrls' },
    { slug: 'cfd' }
  ]

  beforeEach(async () => {
    notifierFake = { omg: Sinon.fake(), omfg: Sinon.fake() }

    serviceStub = Sinon.stub(SendCustomerFileService, 'go')
    Sinon.stub(RegimeModel, 'query').returns(regimes)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('For each regime in the system', () => {
    it("calls the 'SendCustomerFileService'", async () => {
      await CustomerFilesTask.go(notifierFake)

      expect(serviceStub.firstCall.calledWith(regimes[0])).to.be.true()
      expect(serviceStub.secondCall.calledWith(regimes[1])).to.be.true()
    })
  })
})
