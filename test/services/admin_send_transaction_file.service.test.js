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
import SendTransactionFileService from '../../app/services/send_transaction_file.service.js'

// Thing under test
import AdminSendTransactionFileService from '../../app/services/admin_send_transaction_file.service.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

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
