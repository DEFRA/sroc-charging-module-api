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

const { BillRunModel, InvoiceModel, LicenceModel } = require('../../app/models')

// Thing under test
const { InvoiceRebillingCreateTransactionService } = require('../../app/services')

describe('Invoice Rebilling Create Transaction service', () => {
  let originalBillRun
  let rebillBillRun
  let authorisedSystem
  let rebillAuthorisedSystem
  let regime
  let transaction
  let result

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    rebillAuthorisedSystem = await AuthorisedSystemHelper.addSystem('987654321', 'REBILLING', [regime])
    originalBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    rebillBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  describe('when the transaction type is not to be inverted', () => {
    let licence

    beforeEach(async () => {
      const invoice = await addRebillInvoice(rebillBillRun.id, 'TH230000222', 2021, null, 'R')
      licence = await LicenceHelper.addLicence(rebillBillRun.id, 'TONY/TF9222/37', invoice.id)
      transaction = await TransactionHelper.addTransaction(originalBillRun.id, { chargeFinancialYear: 2021 })

      result = await InvoiceRebillingCreateTransactionService.go(transaction, licence, rebillAuthorisedSystem)
    })

    describe('a transaction is created', () => {
      it('on the correct bill run, invoice and licence', async () => {
        expect(result.billRunId).to.equal(licence.billRunId)
        expect(result.invoiceId).to.equal(licence.invoiceId)
        expect(result.licenceId).to.equal(licence.id)
      })

      it('with the correct authorised system', async () => {
        expect(result.createdBy).to.equal(rebillAuthorisedSystem.id)
      })

      it('with the correct values duplicated', async () => {
      // Create a list of all keys in the transaction object and filter out the ones we don't want to check
        const transactionKeys = Object.keys(transaction)
        const keysToSkip = ['id', 'billRunId', 'createdAt', 'updatedAt', 'createdBy', 'invoiceId', 'licenceId']
        const keysToCheck = transactionKeys.filter(key => !keysToSkip.includes(key))

        // Iterate over the remaining keys and check that the result's value matches the original transaction's value
        for (const key of keysToCheck) {
          expect(result[key]).to.equal(transaction[key])
        }
      })

      it('with the correct values not duplicated', async () => {
        // Create a list of all keys in the transaction object and filter out the ones we don't want to check
        const transactionKeys = Object.keys(transaction)
        const keysToInclude = ['id', 'billRunId', 'createdAt', 'updatedAt', 'createdBy', 'invoiceId', 'licenceId']
        const keysToCheck = transactionKeys.filter(key => keysToInclude.includes(key))

        // Iterate over the remaining keys and check that the result's value matches the original transaction's value
        for (const key of keysToCheck) {
          expect(result[key]).to.not.equal(transaction[key])
        }
      })
    })

    describe('and the tally', () => {
      it('is updated for the bill run', async () => {
        const refreshedRebillBillRun = await BillRunModel.query().findById(result.billRunId)

        expect(refreshedRebillBillRun.debitLineCount).to.equal(1)
        expect(refreshedRebillBillRun.debitLineValue).to.equal(772)
      })

      it('is updated for the invoice', async () => {
        const refreshedRebillInvoice = await InvoiceModel.query().findById(result.invoiceId)

        expect(refreshedRebillInvoice.debitLineCount).to.equal(1)
        expect(refreshedRebillInvoice.debitLineValue).to.equal(772)
      })

      it('is updated for the licence', async () => {
        const refreshedRebillLicence = await LicenceModel.query().findById(result.licenceId)

        expect(refreshedRebillLicence.debitLineCount).to.equal(1)
        expect(refreshedRebillLicence.debitLineValue).to.equal(772)
      })
    })
  })

  describe('when the transaction type is to be inverted', () => {
    let licence

    beforeEach(async () => {
      const invoice = await addRebillInvoice(rebillBillRun.id, 'TH230000222', 2021, null, 'C')
      licence = await LicenceHelper.addLicence(rebillBillRun.id, 'TONY/TF9222/37', invoice.id)
    })

    describe('when a debit is passed to the service', () => {
      beforeEach(async () => {
        transaction = await TransactionHelper.addTransaction(originalBillRun.id, {
          chargeFinancialYear: 2021,
          chargeCredit: false
        })

        result = await InvoiceRebillingCreateTransactionService.go(
          transaction, licence, rebillAuthorisedSystem, null, true
        )
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

        result = await InvoiceRebillingCreateTransactionService.go(
          transaction, licence, rebillAuthorisedSystem, null, true
        )
      })

      it('creates a debit', async () => {
        expect(result.chargeCredit).to.be.false()
      })
    })
  })

  async function addRebillInvoice (billRunId, customerReference, financialYear, rebilledInvoiceId, rebilledType) {
    return InvoiceHelper.addInvoice(
      billRunId,
      customerReference,
      financialYear,
      0, 0, 0, 0, 0, 0, 0, 0,
      rebilledInvoiceId,
      rebilledType)
  }
})
