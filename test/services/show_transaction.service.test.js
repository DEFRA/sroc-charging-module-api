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
    let creditTransaction
    let debitTransaction

    beforeEach(async () => {
      const regime = await RegimeHelper.addRegime('wrls', 'Water Resources')
      const authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system', [regime])
      initialBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

      const payload = {
        region: 'A',
        mix: [
          { type: 'mixed-credit', count: 1 }
        ]
      }
      await BillRunGenerator.go(payload, initialBillRun, authorisedSystem, regime)

      const { transactions } = await BillRunModel.query()
        .findById(initialBillRun.id)
        .withGraphFetched('transactions')

      creditTransaction = transactions.find(transaction => transaction.chargeCredit)
      debitTransaction = transactions.find(transaction => !transaction.chargeCredit)
    })

    it('returns a transaction', async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      expect(result instanceof TransactionModel).to.equal(true)
      expect(result.id).to.equal(creditTransaction.id)
    })

    it("returns a result that includes the related 'bill run'", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      const billRun = await BillRunModel.query().findById(creditTransaction.billRunId)

      expect(result.billRun).to.equal(billRun)
    })

    it("returns a result that includes the related 'invoice'", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      const invoice = await InvoiceModel.query().findById(creditTransaction.invoiceId)

      expect(result.invoice).to.equal({ ...invoice, transactionType: invoice.$transactionType() })
    })

    it("returns a result that includes the related 'licence'", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      const licence = await LicenceModel.query().findById(creditTransaction.licenceId)

      expect(result.licence).to.equal(licence)
    })

    it('returns a positive signedChargeValue if the transaction is a debit', async () => {
      const result = await ShowTransactionService.go(debitTransaction.id)

      expect(Math.sign(result.signedChargeValue)).to.equal(1)
    })

    it('returns a negative signedChargeValue if the transaction is a credit', async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      expect(Math.sign(result.signedChargeValue)).to.equal(-1)
    })

    it("returns the 'transactionType' for the invoice", async () => {
      const result = await ShowTransactionService.go(creditTransaction.id)

      expect(result.invoice.transactionType).to.equal('C')
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
