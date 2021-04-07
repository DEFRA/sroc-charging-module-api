'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper
} = require('../support/helpers')

const { CustomerModel } = require('../../app/models')

const { CreateCustomerDetailsService } = require('../../app/services')

// Things we need to stub
const { DeleteFileService, GenerateCustomerFileService, SendFileToS3Service } = require('../../app/services')

// Thing under test
const { SendCustomerFileService } = require('../../app/services')

describe('Send Customer File service', () => {
  let regime
  let billRun
  let deleteStub
  let generateStub
  let sendStub
  let notifierFake

  const payload = {
    customerReference: 'AB12345678',
    customerName: 'CUSTOMER_NAME',
    addressLine1: 'ADDRESS_LINE_1',
    addressLine2: 'ADDRESS_LINE_2',
    addressLine3: 'ADDRESS_LINE_3',
    addressLine4: 'ADDRESS_LINE_4',
    addressLine5: 'ADDRESS_LINE_5',
    addressLine6: 'ADDRESS_LINE_6',
    postcode: 'POSTCODE'
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')

    await CreateCustomerDetailsService.go({ ...payload, region: 'A' }, regime)
    await CreateCustomerDetailsService.go({ ...payload, region: 'W' }, regime)

    deleteStub = Sinon.stub(DeleteFileService, 'go').returns(true)
    generateStub = Sinon.stub(GenerateCustomerFileService, 'go').returns('stubFilename')
    sendStub = Sinon.stub(SendFileToS3Service, 'go').returns(true)

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When a single region is specified', () => {
    describe('and a customer file is required', () => {
      it('generates a customer file', async () => {
        await SendCustomerFileService.go(regime, ['A'])

        expect(generateStub.calledOnce).to.be.true()
        expect(generateStub.getCall(0).args[0]).to.equal(regime)
        expect(generateStub.getCall(0).args[1]).to.equal('A')
      })

      // TODO: Confirm filename
      it('sends the customer file', async () => {
        await SendCustomerFileService.go(regime, ['A'])

        expect(sendStub.calledOnce).to.be.true()
        expect(sendStub.getCall(0).firstArg).to.equal('stubFilename')
        // expect(sendStub.getCall(0).args[1]).to.equal(`${regime.slug}/transaction/${billRun.fileReference}.dat`)
      })

      it('clears the correct region customers from the customer table', async () => {
        await SendCustomerFileService.go(regime, ['A'])

        const customersRegionA = await CustomerModel.query()
          .select('id')
          .where('region', 'A')

        const customersRegionW = await CustomerModel.query()
          .select('id')
          .where('region', 'W')

        expect(customersRegionA).to.be.empty()
        expect(customersRegionW).to.not.be.empty()
      })

      describe('and removeTemporary files is set to `true`', () => {
        before(async () => {
          Sinon.stub(SendCustomerFileService, '_removeTemporaryFiles').returns(true)
        })

        it('deletes the file', async () => {
          await SendCustomerFileService.go(regime, ['A'])

          expect(deleteStub.calledOnce).to.equal(true)
        })
      })

      describe('and removeTemporary files is set to `false`', () => {
        before(async () => {
          Sinon.stub(SendCustomerFileService, '_removeTemporaryFiles').returns(false)
        })

        it("doesn't delete the file", async () => {
          await SendCustomerFileService.go(regime, ['A'])

          expect(deleteStub.called).to.equal(false)
        })
      })
    })

    describe("and a transaction file isn't required", () => {
      it("doesn't try to generate a transaction file", async () => {
        await SendCustomerFileService.go(regime, ['X'])

        expect(generateStub.notCalled).to.be.true()
      })

      it("doesn't try to send the transaction file", async () => {
        await SendCustomerFileService.go(regime, ['X'])

        expect(sendStub.notCalled).to.be.true()
      })
    })
  })

  describe('When a multiple regions are specified', () => {
    describe('and a customer file is required', () => {
      it('generates a customer file', async () => {
        await SendCustomerFileService.go(regime, ['A', 'W'])

        expect(generateStub.calledTwice).to.be.true()
        expect(generateStub.getCall(0).args[0]).to.equal(regime)
        expect(generateStub.getCall(0).args[1]).to.equal('A')
        expect(generateStub.getCall(1).args[0]).to.equal(regime)
        expect(generateStub.getCall(1).args[1]).to.equal('W')
      })

      // TODO: Confirm filename
      it('sends the customer file', async () => {
        await SendCustomerFileService.go(regime, ['A', 'W'])

        expect(sendStub.calledTwice).to.be.true()
        expect(sendStub.getCall(0).firstArg).to.equal('stubFilename')
        // expect(sendStub.getCall(0).args[1]).to.equal(`${regime.slug}/transaction/${billRun.fileReference}.dat`)
      })

      it('clears the correct region customers from the customer table', async () => {
        await SendCustomerFileService.go(regime, ['A', 'W'])

        const customers = await CustomerModel.query()
          .select('id')

        expect(customers).to.be.empty()
      })

      describe('and removeTemporary files is set to `true`', () => {
        before(async () => {
          Sinon.stub(SendCustomerFileService, '_removeTemporaryFiles').returns(true)
        })

        it('deletes the file', async () => {
          await SendCustomerFileService.go(regime, ['A', 'W'])

          expect(deleteStub.calledTwice).to.equal(true)
        })
      })

      describe('and removeTemporary files is set to `false`', () => {
        before(async () => {
          Sinon.stub(SendCustomerFileService, '_removeTemporaryFiles').returns(false)
        })

        it("doesn't delete the file", async () => {
          await SendCustomerFileService.go(regime, ['A', 'W'])

          expect(deleteStub.called).to.equal(false)
        })
      })
    })

    describe("and a transaction file isn't required", () => {
      it("doesn't try to generate a transaction file", async () => {
        await SendCustomerFileService.go(regime, ['X'])

        expect(generateStub.notCalled).to.be.true()
      })

      it("doesn't try to send the transaction file", async () => {
        await SendCustomerFileService.go(regime, ['X'])

        expect(sendStub.notCalled).to.be.true()
      })
    })
  })

  // describe('When an invalid bill run is specified', () => {
  //   describe("because the status is not 'pending'", () => {
  //     it('throws an error', async () => {
  //       await SendCustomerFileService.go(regime, billRun, notifierFake)

  //       expect(notifierFake.omfg.callCount).to.equal(1)

  //       expect(notifierFake.omfg.firstArg).to.equal('Error sending transaction file')
  //       expect(notifierFake.omfg.lastArg.filename).to.be.undefined()
  //       expect(notifierFake.omfg.lastArg.error.message).to.equal(`Bill run ${billRun.id} does not have a status of 'pending'.`)
  //     })
  //   })
  // })
})
