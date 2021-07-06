// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Things we need to stub
import RegimeModel from '../../app/models/regime.model.js'
import SendCustomerFileService from '../../app/services/show_customer_file.service.js'

// Thing under test
import CustomerFilesTask from '../../app/tasks/customer_files.task.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

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
