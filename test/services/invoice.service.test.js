'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, GeneralHelper } = require('../support/helpers')

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
    it('returns correct data', async () => {
      const result = await InvoiceService.go(transaction)

      expect(result.billRunId).to.equal(transaction.billRunId)
      expect(result.customerReference).to.equal(transaction.customerReference)
      expect(result.financialYear).to.equal(transaction.chargeFinancialYear)
    })
  })

  describe('When a debit transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      const result = await InvoiceService.go(transaction)

      expect(result.debitCount).to.equal(1)
      expect(result.debitValue).to.equal(transaction.chargeValue)
    })
  })

  describe('When a credit transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      transaction.chargeCredit = true
      const result = await InvoiceService.go(transaction)

      expect(result.creditCount).to.equal(1)
      expect(result.creditValue).to.equal(transaction.chargeValue)
    })
  })

  describe('When a zero value transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      transaction.chargeValue = 0
      const result = await InvoiceService.go(transaction)

      expect(result.zeroCount).to.equal(1)
    })
  })

  describe('When a new licence transaction is supplied', () => {
    it('correctly sets the new licence flag', async () => {
      transaction.newLicence = true
      const result = await InvoiceService.go(transaction)

      expect(result.newLicenceCount).to.equal(1)
    })
  })
})
