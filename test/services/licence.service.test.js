'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, GeneralHelper } = require('../support/helpers')
const { LicenceModel } = require('../../app/models')

// Thing under test
const { LicenceService } = require('../../app/services')

describe('Licence service', () => {
  let transaction

  const dummyTransaction = {
    invoiceId: 'f0d3b4dc-2cae-11eb-adc1-0242ac120002',
    lineAttr1: 'LICENCE_NUMBER',
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
    it('creates a licence', async () => {
      const licence = await LicenceService.go(transaction)
      const result = await LicenceModel.query().findById(licence.id)

      expect(result.id).to.exist()
    })

    it('returns correct data', async () => {
      const licence = await LicenceService.go(transaction)

      expect(licence.invoiceId).to.equal(transaction.invoiceId)
      expect(licence.customerReference).to.equal(transaction.customerReference)
      expect(licence.financialYear).to.equal(transaction.chargeFinancialYear)
    })
  })

  describe('When a debit transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      const licence = await LicenceService.go(transaction)

      expect(licence.debitCount).to.equal(1)
      expect(licence.debitValue).to.equal(transaction.chargeValue)
    })
  })

  describe('When a credit transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      transaction.chargeCredit = true
      const licence = await LicenceService.go(transaction)

      expect(licence.creditCount).to.equal(1)
      expect(licence.creditValue).to.equal(transaction.chargeValue)
    })
  })

  describe('When a zero value transaction is supplied', () => {
    it('correctly calculates the summary', async () => {
      transaction.chargeValue = 0
      const licence = await LicenceService.go(transaction)

      expect(licence.zeroCount).to.equal(1)
    })
  })

  describe('When a new licence transaction is supplied', () => {
    it('correctly sets the new licence flag', async () => {
      transaction.newLicence = true
      const licence = await LicenceService.go(transaction)

      expect(licence.newLicenceCount).to.equal(1)
    })
  })

  describe('When two transactions are created', () => {
    it('correctly calculates the summary', async () => {
      const firstLicence = await LicenceService.go(transaction)
      // We save the licence with stats to the database as this isn't done by LicenceService
      await LicenceModel.query().update(firstLicence)

      const secondLicence = await LicenceService.go(transaction)

      expect(secondLicence.debitCount).to.equal(2)
      expect(secondLicence.debitValue).to.equal(transaction.chargeValue * 2)
    })
  })
})
