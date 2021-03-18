'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper
} = require('../support/helpers')

// Things we need to stub
const { GenerateTransactionFileService, SendFileToS3Service } = require('../../app/services')

// Thing under test
const { SendTransactionFileService } = require('../../app/services')

describe('Send Transaction File service', () => {
  let regime
  let billRun
  let generateStub
  let sendStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(regime.id, GeneralHelper.uuid4())

    generateStub = Sinon.stub(GenerateTransactionFileService, 'go').returns('stubFilename')
    sendStub = Sinon.stub(SendFileToS3Service, 'go').returns(true)
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
        const err = await expect(SendTransactionFileService.go(regime, billRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${billRun.id} does not have a status of 'pending'.`)
      })
    })
  })
})
