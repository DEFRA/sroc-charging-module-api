// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Things we need to stub
import DeleteFileService from '../../app/services/delete_file.service.js'
import GenerateTransactionFileService from '../../app/services/generate_transaction_file.service.js'
import SendFileToS3Service from '../../app/services/send_file_to_s3.service.js'

// Thing under test
import SendTransactionFileService from '../../app/services/send_transaction_file.service.js'

// Test framework setup
const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Send Transaction File service', () => {
  let regime
  let billRun
  let deleteStub
  let generateStub
  let sendStub
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(regime.id, GeneralHelper.uuid4())

    deleteStub = Sinon.stub(DeleteFileService, 'go').returns(true)
    generateStub = Sinon.stub(GenerateTransactionFileService, 'go').returns('stubFilename')
    sendStub = Sinon.stub(SendFileToS3Service, 'go').returns(true)

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
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
        expect(generateStub.getCall(0).args[1]).to.equal(`${billRun.fileReference}.dat`)
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
        await SendTransactionFileService.go(regime, billRun, notifierFake)

        expect(notifierFake.omfg.callCount).to.equal(1)

        expect(notifierFake.omfg.firstArg).to.equal('Error sending transaction file')
        expect(notifierFake.omfg.lastArg.filename).to.be.undefined()
        expect(notifierFake.omfg.lastArg.error.message).to.equal(`Bill run ${billRun.id} does not have a status of 'pending'.`)
      })
    })
  })
})
