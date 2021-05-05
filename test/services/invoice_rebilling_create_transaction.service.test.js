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
  RegimeHelper,
  TransactionHelper,
  InvoiceHelper,
  LicenceHelper
} = require('../support/helpers')

// Thing under test
const { InvoiceRebillingCreateTransactionService } = require('../../app/services')

describe('Invoice Rebilling Create Transaction service', () => {
  let originalBillRun
  let rebillBillRun
  let authorisedSystem
  let regime
  let transaction
  let result

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    originalBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    rebillBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  describe('when the transaction type is not to be inverted', () => {
    let licence

    beforeEach(async () => {
      const invoice = await InvoiceHelper.addInvoice(rebillBillRun.id, 'TH230000222', 2021)
      licence = await LicenceHelper.addLicence(rebillBillRun.id, 'TH230000222', invoice.id)
      transaction = await TransactionHelper.addTransaction(originalBillRun.id, { chargeFinancialYear: 2021 })

      result = await InvoiceRebillingCreateTransactionService.go(transaction, licence)
    })

    it('creates a transaction', async () => {
      expect(result.id).to.exist()
    })

    it('creates the transaction on the correct bill run, invoice and licence', async () => {
      expect(result.billRunId).to.equal(licence.billRunId)
      expect(result.invoiceId).to.equal(licence.invoiceId)
      expect(result.licenceId).to.equal(licence.id)
    })

    it('creates the transaction with the correct values', async () => {
      // Create a list of all keys in the transaction object and filter out the ones we don't want to check
      const transactionKeys = Object.keys(transaction)
      const keysToSkip = ['id', 'billRunId', 'createdAt', 'updatedAt', 'createdBy', 'invoiceId', 'licenceId']
      const keysToCheck = transactionKeys.filter(key => !keysToSkip.includes(key))

      // Iterate over the remaining keys and check that the result's value matches the original transaction's value
      for (const key in keysToCheck) {
        expect(result[key]).to.equal(transaction[key])
      }
    })
  })

  describe('when the transaction type is to be inverted', () => {
    let licence

    beforeEach(async () => {
      const invoice = await InvoiceHelper.addInvoice(rebillBillRun.id, 'TH230000222', 2021)
      licence = await LicenceHelper.addLicence(rebillBillRun.id, 'TH230000222', invoice.id)
    })

    describe('when a debit is passed to the service', () => {
      beforeEach(async () => {
        transaction = await TransactionHelper.addTransaction(originalBillRun.id, {
          chargeFinancialYear: 2021,
          chargeCredit: false
        })

        result = await InvoiceRebillingCreateTransactionService.go(transaction, licence, true)
      })

      it('creates a credit', async () => {
        expect(result.chargeCredit).to.be.true()
      })
    })

    describe('when a credit is passed to the service', () => {
      beforeEach(async () => {
        transaction = await TransactionHelper.addTransaction(originalBillRun.id, {
          chargeFinancialYear: 2021,
          chargeCredit: true
        })

        result = await InvoiceRebillingCreateTransactionService.go(transaction, licence, true)
      })

      it('creates a credit', async () => {
        expect(result.chargeCredit).to.be.false()
      })
    })
  })
})
