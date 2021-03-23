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

// Things we need to stub
const { DeleteFileService, GenerateTransactionFileService, SendFileToS3Service } = require('../../app/services')

// Thing under test
const { SendTransactionFileService } = require('../../app/services')

describe('Send Transaction File service', () => {
  let regime
  let billRun
  let deleteStub
  let generateStub
  let sendStub
  let notifyFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(regime.id, GeneralHelper.uuid4())

    deleteStub = Sinon.stub(DeleteFileService, 'go').returns(true)
    generateStub = Sinon.stub(GenerateTransactionFileService, 'go').returns('stubFilename')
    sendStub = Sinon.stub(SendFileToS3Service, 'go').returns(true)

    // Create a fake function to stand in place of server.methods.notify
    notifyFake = Sinon.fake()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When a valid bill run is specified', () => {
    beforeEach(async () => {
      billRun.status = 'pending'
    })

    describe('and a transaction file is required', () => {
      beforeEach(async () => {
        billRun.fileReference = 'FILE_REFERENCE'
      })

      it('generates a transaction file', async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(generateStub.calledOnce).to.be.true()
        expect(generateStub.getCall(0).firstArg).to.equal(`${billRun.fileReference}.dat`)
      })

      it('sends the transaction file', async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(sendStub.calledOnce).to.be.true()
        expect(sendStub.getCall(0).firstArg).to.equal('stubFilename')
        expect(sendStub.getCall(0).args[1]).to.equal(`${regime.slug}/transaction/${billRun.fileReference}.dat`)
      })

      it("sets the bill run status to 'billed'", async () => {
        await SendTransactionFileService.go(regime, billRun)

        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun.status).to.equal('billed')
      })

      describe('and removeTemporary files is set to `true`', () => {
        before(async () => {
          Sinon.stub(SendTransactionFileService, '_removeTemporaryFiles').returns(true)
        })

        it('deletes the file', async () => {
          await SendTransactionFileService.go(regime, billRun)

          expect(deleteStub.calledOnce).to.equal(true)
        })
      })

      describe('and removeTemporary files is set to `false`', () => {
        before(async () => {
          Sinon.stub(SendTransactionFileService, '_removeTemporaryFiles').returns(false)
        })

        it("doesn't delete the file", async () => {
          await SendTransactionFileService.go(regime, billRun)

          expect(deleteStub.called).to.equal(false)
        })
      })
    })

    describe("and a transaction file isn't required", () => {
      it("doesn't try to generate a transaction file", async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(generateStub.notCalled).to.be.true()
      })

      it("doesn't try to send the transaction file", async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(sendStub.notCalled).to.be.true()
      })

      it("sets the bill run status to 'billing_not_required'", async () => {
        await SendTransactionFileService.go(regime, billRun)

        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun.status).to.equal('billing_not_required')
      })
    })
  })

  describe('When an invalid bill run is specified', () => {
    describe("because the status is not 'pending'", () => {
      it('throws an error', async () => {
        await SendTransactionFileService.go(regime, billRun, notifyFake)

        expect(notifyFake.calledOnceWithExactly(
          `Error sending transaction file: Error: Bill run ${billRun.id} does not have a status of 'pending'.`
        )).to.equal(true)
      })
    })
  })
})
