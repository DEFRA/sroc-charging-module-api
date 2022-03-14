'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper } = require('../../../support/helpers')
const { DatabaseHelper } = require('../../../support/helpers')
const { GeneralHelper } = require('../../../support/helpers')
const { RegimeHelper } = require('../../../support/helpers')

// Things we need to stub
const { DeleteFileService } = require('../../../../app/services')
const { GeneratePresrocTransactionFileService } = require('../../../../app/services')
const { GenerateSrocTransactionFileService } = require('../../../../app/services')
const { SendFileToS3Service } = require('../../../../app/services')

// Thing under test
const { SendTransactionFileService } = require('../../../../app/services')

describe('Send Transaction File service', () => {
  let regime
  let billRun
  let deleteStub
  let generatePresrocStub
  let generateSrocStub
  let sendStub
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(regime.id, GeneralHelper.uuid4())

    deleteStub = Sinon.stub(DeleteFileService, 'go')
    generatePresrocStub = Sinon.stub(GeneratePresrocTransactionFileService, 'go').returns('stubPresrocFilename')
    generateSrocStub = Sinon.stub(GenerateSrocTransactionFileService, 'go').returns('stubSrocFilename')
    sendStub = Sinon.stub(SendFileToS3Service, 'go')

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When a valid bill run is specified', () => {
    beforeEach(async () => {
      billRun.status = 'sending'
    })

    describe('the service generates the transaction file based on the rulset', () => {
      beforeEach(async () => {
        billRun.fileReference = 'FILE_REFERENCE'
      })

      describe('so, if the bill run is for presroc', () => {
        it('generates a presroc transaction file', async () => {
          await SendTransactionFileService.go(regime, billRun)

          expect(generatePresrocStub.calledOnce).to.be.true()
          expect(generateSrocStub.calledOnce).to.be.false()
        })
      })

      describe('so, if the bill run is for sroc', () => {
        beforeEach(async () => {
          billRun.ruleset = 'sroc'
        })

        it('generates an sroc transaction file', async () => {
          await SendTransactionFileService.go(regime, billRun)

          expect(generatePresrocStub.calledOnce).to.be.false()
          expect(generateSrocStub.calledOnce).to.be.true()
        })
      })

      describe('but, if the bill run has an invalid ruleset', () => {
        beforeEach(async () => {
          billRun.ruleset = 'INVALID'
        })

        it('throws an error', async () => {
          const err = await expect(
            SendTransactionFileService.go(regime, billRun)
          ).to.reject()

          expect(err).to.be.an.error()
        })
      })
    })

    describe('and a transaction file is required', () => {
      beforeEach(async () => {
        billRun.fileReference = 'FILE_REFERENCE'
      })

      it('generates a transaction file', async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(generatePresrocStub.calledOnce).to.be.true()
        expect(generatePresrocStub.getCall(0).args[1]).to.equal(`${billRun.fileReference}.dat`)
      })

      it('sends the transaction file', async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(sendStub.calledOnce).to.be.true()
        expect(sendStub.getCall(0).firstArg).to.equal('stubPresrocFilename')
        expect(sendStub.getCall(0).args[1]).to.equal(`export/${regime.slug}/transaction/${billRun.fileReference}.dat`)
      })

      it("sets the bill run status to 'billed'", async () => {
        await SendTransactionFileService.go(regime, billRun)

        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun.status).to.equal('billed')
      })

      it('deletes the file', async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(deleteStub.calledOnce).to.equal(true)
      })
    })

    describe("and a transaction file isn't required", () => {
      it("doesn't try to generate a transaction file", async () => {
        await SendTransactionFileService.go(regime, billRun)

        expect(generatePresrocStub.notCalled).to.be.true()
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
    describe("because the status is not 'sending'", () => {
      it('throws an error', async () => {
        await SendTransactionFileService.go(regime, billRun, notifierFake)

        expect(notifierFake.omfg.callCount).to.equal(1)

        expect(notifierFake.omfg.firstArg).to.equal('Error sending transaction file')
        expect(notifierFake.omfg.lastArg.filename).to.be.undefined()
        expect(notifierFake.omfg.lastArg.error.message).to.equal(`Bill run ${billRun.id} does not have a status of 'sending'.`)
      })
    })
  })
})
