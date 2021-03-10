'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  TransactionHelper
} = require('../support/helpers')

// Thing under test
const { DeleteBillRunService } = require('../../app/services')

describe('Delete Bill Run service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())

    await TransactionHelper.addTransaction(billRun.id)
  })

  describe('When a valid bill run is supplied', () => {
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
})
