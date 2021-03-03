'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, GeneralHelper } = require('../support/helpers')
const { InvoiceModel } = require('../../app/models')

// Thing under test
const { InvoiceService } = require('../../app/services')

describe('Invoice service', () => {
  let transaction

  const dummyTransaction = {
    billRunId: 'f0d3b4dc-2cae-11eb-adc1-0242ac120002',
    customerReference: 'CUSTOMER_REFERENCE',
    chargeFinancialYear: 2021,
    chargeCredit: false,
    chargeValue: 5678
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    transaction = GeneralHelper.cloneObject(dummyTransaction)
  })

  describe('When a valid transaction is supplied', () => {
    it('creates an invoice', async () => {
      const invoice = await InvoiceService.go(transaction)
      const result = await InvoiceModel.query().findById(invoice.id)

      expect(result.id).to.exist()
    })

    it('returns correct data', async () => {
      const invoice = await InvoiceService.go(transaction)

      expect(invoice.billRunId).to.equal(transaction.billRunId)
      expect(invoice.customerReference).to.equal(transaction.customerReference)
      expect(invoice.financialYear).to.equal(transaction.chargeFinancialYear)
    })
  })

  describe('When a debit transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      const invoice = await InvoiceService.go(transaction)

      expect(invoice.debitLineCount).to.equal(1)
      expect(invoice.debitLineValue).to.equal(transaction.chargeValue)
    })
  })

  describe('When a credit transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      transaction.chargeCredit = true
      const invoice = await InvoiceService.go(transaction)

      expect(invoice.creditLineCount).to.equal(1)
      expect(invoice.creditLineValue).to.equal(transaction.chargeValue)
    })
  })

  describe('When a zero value transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      transaction.chargeValue = 0
      const invoice = await InvoiceService.go(transaction)

      expect(invoice.zeroLineCount).to.equal(1)
    })
  })

  describe('When a transaction subject to minimum charge is supplied', () => {
    beforeEach(async () => {
      transaction.subjectToMinimumCharge = true
    })

    it('correctly sets the subject to minimum charge flag', async () => {
      const result = await InvoiceService.go(transaction)

      expect(result.subjectToMinimumChargeCount).to.equal(1)
    })

    describe('and the total is needed', () => {
      it('correctly calculates the total for a debit', async () => {
        const firstResult = await InvoiceService.go(transaction)
        // We save the invoice with stats to the database as this isn't done by InvoiceService
        await InvoiceModel.query().update(firstResult)

        const secondInvoice = await InvoiceService.go(transaction)

        expect(secondInvoice.subjectToMinimumChargeCount).to.equal(2)
        expect(secondInvoice.subjectToMinimumChargeDebitValue).to.equal(transaction.chargeValue * 2)
      })

      it('correctly calculates the total for a credit', async () => {
        transaction.chargeCredit = true

        const firstResult = await InvoiceService.go(transaction)
        // We save the invoice with stats to the database as this isn't done by InvoiceService
        await InvoiceModel.query().update(firstResult)

        const secondInvoice = await InvoiceService.go(transaction)

        expect(secondInvoice.subjectToMinimumChargeCount).to.equal(2)
        expect(secondInvoice.subjectToMinimumChargeCreditValue).to.equal(transaction.chargeValue * 2)
      })
    })
  })

  describe('When two transactions are created', () => {
    it('correctly calculates the summary', async () => {
      const firstResult = await InvoiceService.go(transaction)
      // We save the invoice with stats to the database as this isn't done by InvoiceService
      await InvoiceModel.query().update(firstResult)

      const secondInvoice = await InvoiceService.go(transaction)

      expect(secondInvoice.debitLineCount).to.equal(2)
      expect(secondInvoice.debitLineValue).to.equal(transaction.chargeValue * 2)
    })
  })
})
