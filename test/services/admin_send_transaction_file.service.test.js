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

// Things to stub
const { SendTransactionFileService } = require('../../app/services')

// Thing under test
const { AdminSendTransactionFileService } = require('../../app/services')

describe('Admin Send Transaction File service', () => {
  let regime
  let billRun
  let sendTransactionFileStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)

    sendTransactionFileStub = Sinon.stub(SendTransactionFileService, 'go')
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When the transaction file can be sent', () => {
    describe('because the bill run status is `pending`', () => {
      it('calls SendTransactionFileService with the correct params', async () => {
        billRun.status = 'pending'

        await AdminSendTransactionFileService.go(regime, billRun)

        expect(sendTransactionFileStub.calledOnceWith(regime, billRun)).to.be.true()
      })
    })
  })

  describe('When the transaction file cannot be sent', () => {
    describe('because the bill run status is not `pending`', () => {
      it('throws an error', async () => {
        const err = await expect(AdminSendTransactionFileService.go(regime, billRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${billRun.id} does not have a status of 'pending'.`)
      })
    })
  })
})
