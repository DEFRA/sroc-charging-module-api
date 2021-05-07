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
  InvoiceHelper,
  RegimeHelper,
  TransactionHelper
} = require('../support/helpers')

const { LicenceModel, TransactionModel } = require('../../app/models')

// Thing under test
const { InvoiceRebillingService } = require('../../app/services')

describe('Invoice Rebilling service', () => {
  let currentBillRun
  let newBillRun
  let authorisedSystem
  let regime
  let cancelInvoice
  let rebillInvoice

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
  })

  describe('When the service is called', () => {
    beforeEach(async () => {
      currentBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'billed')
      newBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

      const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER_REFERENCE', 2020)
      await createPopulatedLicence(invoice, 'LICENCE001')
      await createPopulatedLicence(invoice, 'LICENCE002')
      await createPopulatedLicence(invoice, 'LICENCE003')

      cancelInvoice = await addRebillInvoice(newBillRun.id, 'CUSTOMER_REFERENCE', 2020, invoice.id, 'C')
      rebillInvoice = await addRebillInvoice(newBillRun.id, 'CUSTOMER_REFERENCE', 2020, invoice.id, 'R')

      await InvoiceRebillingService.go(invoice, cancelInvoice, rebillInvoice)
    })

    describe('cancel licences', () => {
      let licences

      beforeEach(async () => {
        licences = await LicenceModel.query().where('invoiceId', cancelInvoice.id)
      })

      it('are created for each licence of the original invoice', async () => {
        const licenceNumbers = licences.map(licence => licence.licenceNumber)

        expect(licenceNumbers.length).to.equal(3)
        expect(licenceNumbers).to.only.contain(['LICENCE001', 'LICENCE002', 'LICENCE003'])
      })

      it('are populated with the original transactions reversed', async () => {
        for (const licence of licences) {
          const transactions = await TransactionModel.query().where('licenceId', licence.id)
          const lineDescriptions = transactions.map(transaction => transaction.lineDescription)
          const chargeCredits = transactions.map(transaction => transaction.chargeCredit)

          expect(transactions.length).to.equal(3)
          expect(chargeCredits).to.only.contain(true)
          expect(lineDescriptions).to.only.contain(['TRANSACTION001', 'TRANSACTION002', 'TRANSACTION003'])
        }
      })
    })

    describe('rebill licences', () => {
      let licences

      beforeEach(async () => {
        licences = await LicenceModel.query().where('invoiceId', rebillInvoice.id)
      })

      it('are created for each licence of the original invoice', async () => {
        const licenceNumbers = licences.map(licence => licence.licenceNumber)

        expect(licenceNumbers.length).to.equal(3)
        expect(licenceNumbers).to.only.contain(['LICENCE001', 'LICENCE002', 'LICENCE003'])
      })

      it('are populated with the original transactions', async () => {
        for (const licence of licences) {
          const transactions = await TransactionModel.query().where('licenceId', licence.id)
          const lineDescriptions = transactions.map(transaction => transaction.lineDescription)
          const chargeCredits = transactions.map(transaction => transaction.chargeCredit)

          expect(transactions.length).to.equal(3)
          expect(chargeCredits).to.only.contain(false)
          expect(lineDescriptions).to.only.contain(['TRANSACTION001', 'TRANSACTION002', 'TRANSACTION003'])
        }
      })
    })
  })

  async function createPopulatedLicence (invoice, licenceNumber) {
    const licence = await LicenceModel.query()
      .insert({
        invoiceId: invoice.id,
        billRunId: invoice.billRunId,
        licenceNumber
      })

    await addTransactionToLicence(invoice, licence, licenceNumber, 'TRANSACTION001')
    await addTransactionToLicence(invoice, licence, licenceNumber, 'TRANSACTION002')
    await addTransactionToLicence(invoice, licence, licenceNumber, 'TRANSACTION003')

    return licence
  }

  async function addTransactionToLicence (invoice, licence, licenceNumber, lineDescription) {
    await TransactionHelper.addTransaction(currentBillRun.id, {
      invoiceId: invoice.id,
      licenceId: licence.id,
      chargeFinancialYear: 2020,
      customerReference: 'CUSTOMER_REFERENCE',
      lineAttr1: licenceNumber,
      lineDescription
    })
  }

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
