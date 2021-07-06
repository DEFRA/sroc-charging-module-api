// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Thing under test
import DeleteBillRunService from '../../app/services/delete_bill_run.service.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Delete Bill Run service', () => {
  let billRun
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())

    await TransactionHelper.addTransaction(billRun.id)

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid bill run is supplied', () => {
    it("sets the bill run status to 'deleting'", async () => {
      // We stub the part that actually deletes the bill run for this test so we can confirm the bill run status is
      // updated
      Sinon.stub(DeleteBillRunService, '_deleteBillRun')
      await DeleteBillRunService.go(billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun.status).to.equal('deleting')
    })

    it('deletes the bill run', async () => {
      await DeleteBillRunService.go(billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun).to.not.exist()
    })

    it('deletes the bill run invoices', async () => {
      await DeleteBillRunService.go(billRun)

      const invoices = await billRun.$relatedQuery('invoices')

      expect(invoices).to.be.empty()
    })

    it('deletes the bill run licences', async () => {
      await DeleteBillRunService.go(billRun)

      const licences = await billRun.$relatedQuery('licences')

      expect(licences).to.be.empty()
    })

    it('deletes the bill run transactions', async () => {
      await DeleteBillRunService.go(billRun)

      const transactions = await billRun.$relatedQuery('transactions')

      expect(transactions).to.be.empty()
    })
  })

  describe('When an error occurs', () => {
    it('calls the notifier', async () => {
      Sinon.stub(DeleteBillRunService, '_deleteBillRun').throws()
      await DeleteBillRunService.go(billRun, notifierFake)

      expect(notifierFake.omfg.callCount).to.equal(1)
      expect(notifierFake.omfg.firstArg).to.equal('Error deleting bill run')
    })
  })
})
