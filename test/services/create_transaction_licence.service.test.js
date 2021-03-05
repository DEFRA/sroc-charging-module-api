'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, GeneralHelper, InvoiceHelper, LicenceHelper } = require('../support/helpers')

// Thing under test
const { CreateTransactionLicenceService } = require('../../app/services')

describe('Create Transaction Licence service', () => {
  let transaction

  beforeEach(async () => {
    // The service will create an licence record if none exists already for the transaction so we need a database
    // cleaner call
    await DatabaseHelper.clean()

    transaction = {
      billRunId: GeneralHelper.uuid4(),
      lineAttr1: 'LICENCE_NUMBER',
      customerReference: 'CUSTOMER_REFERENCE',
      chargeFinancialYear: 2021,
      chargeCredit: false,
      chargeValue: 5678
    }

    const invoice = await InvoiceHelper.addInvoice(
      transaction.billRunId,
      transaction.customerReference,
      transaction.chargeFinancialYear
    )
    transaction.invoiceId = invoice.id
  })

  describe('When a valid debit transaction is supplied', () => {
    it("correctly generates and returns a 'patch' object", async () => {
      const result = await CreateTransactionLicenceService.go(transaction)

      expect(result.update).to.only.include(['debitLineCount', 'debitLineValue'])
    })

    describe('subject to minimum charge', () => {
      beforeEach(async () => {
        transaction.subjectToMinimumCharge = true
      })

      it("correctly generates and returns a 'patch' object", async () => {
        const result = await CreateTransactionLicenceService.go(transaction)

        expect(result.update).to.only.include([
          'debitLineCount',
          'debitLineValue',
          'subjectToMinimumChargeCount',
          'subjectToMinimumChargeDebitValue'
        ])
      })
    })
  })

  describe('and a credit transaction', () => {
    beforeEach(() => {
      transaction.chargeCredit = true
    })

    it('correctly generates the patch', async () => {
      const result = await CreateTransactionLicenceService.go(transaction)

      expect(result.update).to.only.include(['creditLineCount', 'creditLineValue'])
    })

    describe('subject to minimum charge', () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      it("correctly generates and returns a 'patch' object", async () => {
        const result = await CreateTransactionLicenceService.go(transaction)

        expect(result.update).to.only.include([
          'creditLineCount',
          'creditLineValue',
          'subjectToMinimumChargeCount',
          'subjectToMinimumChargeCreditValue'
        ])
      })
    })
  })

  describe('and a zero value transaction', () => {
    beforeEach(() => {
      transaction.chargeValue = 0
    })

    it('correctly generates the patch', async () => {
      const result = await CreateTransactionLicenceService.go(transaction)

      expect(result.update).to.only.include(['zeroLineCount'])
    })
  })

  describe("When a 'licence' already exists", () => {
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.addLicence(
        transaction.billRunId,
        transaction.lineAttr1,
        transaction.invoiceId,
        transaction.customerReference,
        transaction.chargeFinancialYear
      )
    })

    describe("the 'patch' object returned", () => {
      it('contains the matching licence ID', async () => {
        const result = await CreateTransactionLicenceService.go(transaction)

        expect(result.id).to.equal(licence.id)
      })
    })
  })
})
