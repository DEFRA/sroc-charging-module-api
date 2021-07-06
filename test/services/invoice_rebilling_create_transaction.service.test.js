// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import InvoiceHelper from '../support/helpers/invoice.helper.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Things we need to stub

// Additional dependencies needed
import BillRunModel from '../../app/models/bill_run.model.js'
import InvoiceModel from '../../app/models/invoice.model.js'
import LicenceModel from '../../app/models/licence.model.js'

// Thing under test
import InvoiceRebillingCreateTransactionService from '../../app/services/invoice_rebilling_create_transaction.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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

  describe('when the original transaction contains a client ID', () => {
    beforeEach(async () => {
      const invoice = await addRebillInvoice(rebillBillRun.id, 'TH230000222', 2021, null, 'R')
      const licence = await LicenceHelper.addLicence(rebillBillRun.id, 'TONY/TF9222/37', invoice.id)
      transaction = await TransactionHelper.addTransaction(
        originalBillRun.id,
        { chargeFinancialYear: 2021, clientId: 'CANBEONLYONE' }
      )

      result = await InvoiceRebillingCreateTransactionService.go(transaction, licence, rebillAuthorisedSystem)
    })

    it('still can create the new rebilling transaction (the DB unique constraint does not block it)', () => {
      expect(result.id).to.exist()
      expect(result.clientId).to.be.undefined()
    })
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
        const keysToSkip = ['id', 'billRunId', 'createdAt', 'updatedAt', 'createdBy', 'invoiceId', 'licenceId', 'clientId', 'rebilledTransactionId']
        const keysToCheck = transactionKeys.filter(key => !keysToSkip.includes(key))

        // Iterate over the remaining keys and check that the result's value matches the original transaction's value
        for (const key of keysToCheck) {
          expect(result[key]).to.equal(transaction[key])
        }
      })

      it('with the correct values not duplicated', async () => {
        // Create a list of all keys in the transaction object and filter out the ones we don't want to check
        const transactionKeys = Object.keys(transaction)
        const keysToInclude = ['id', 'billRunId', 'createdAt', 'updatedAt', 'createdBy', 'invoiceId', 'licenceId', 'clientId']
        const keysToCheck = transactionKeys.filter(key => keysToInclude.includes(key))

        // Iterate over the remaining keys and check that the result's value matches the original transaction's value
        for (const key of keysToCheck) {
          expect(result[key]).to.not.equal(transaction[key])
        }
      })

      it('records a link back to the original transaction', async () => {
        expect(result.rebilledTransactionId).to.equal(transaction.id)
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
