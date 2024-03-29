'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')

// Thing under test
const DeleteBillRunService = require('../../../app/services/bill_runs/delete_bill_run.service.js')

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
    it("sets the bill run status to 'pending'", async () => {
      // We stub the part that actually deletes the bill run for this test so we can confirm the bill run status is
      // updated
      Sinon.stub(DeleteBillRunService, '_deleteBillRun')
      await DeleteBillRunService.go(billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun.status).to.equal('pending')
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
