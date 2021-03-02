'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper
} = require('../support/helpers')
const { BillRunGenerator } = require('../support/generators')
const { BillRunModel, InvoiceModel, LicenceModel, TransactionModel } = require('../../app/models')
const { DataError } = require('objection')

// Thing under test
const { ShowTransactionService } = require('../../app/services')

describe('Show Transaction service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there is a matching transaction', () => {
    let initialBillRun
    let transaction

    beforeEach(async () => {
      const regime = await RegimeHelper.addRegime('wrls', 'Water Resources')
      const authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system', [regime])
      initialBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

      const payload = {
        region: 'A',
        mix: [
          { type: 'mixed-invoice', count: 1 }
        ]
      }
      await BillRunGenerator.go(payload, initialBillRun, authorisedSystem, regime)

      const { transactions } = await BillRunModel.query()
        .findById(initialBillRun.id)
        .withGraphFetched('transactions')
      transaction = transactions[0]
    })

    it('returns a transaction', async () => {
      const result = await ShowTransactionService.go(transaction.id)

      expect(result instanceof TransactionModel).to.equal(true)
      expect(result.id).to.equal(transaction.id)
    })

    it("returns a result that includes the related 'bill run'", async () => {
      const result = await ShowTransactionService.go(transaction.id)

      const billRun = await BillRunModel.query().findById(transaction.billRunId)

      expect(result.billRun).to.equal(billRun)
    })

    it("returns a result that includes the related 'invoice'", async () => {
      const result = await ShowTransactionService.go(transaction.id)

      const invoice = await InvoiceModel.query().findById(transaction.invoiceId)

      expect(result.invoice).to.equal(invoice)
    })

    it("returns a result that includes the related 'licence'", async () => {
      const result = await ShowTransactionService.go(transaction.id)

      const licence = await LicenceModel.query().findById(transaction.licenceId)

      expect(result.licence).to.equal(licence)
    })
  })

  describe('When there is no matching transaction', () => {
    it('throws an error', async () => {
      const id = GeneralHelper.uuid4()
      const err = await expect(ShowTransactionService.go(id)).to.reject(Error, `No transaction found with id ${id}`)

      expect(err).to.be.an.error()
    })
  })

  describe('When an invalid UUID is used', () => {
    it('throws an error', async () => {
      const err = await expect(ShowTransactionService.go('123456789')).to.reject(DataError)

      expect(err).to.be.an.error()
    })
  })
})
