'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper } = require('../../helpers')
const { InvoiceModel } = require('../../../../app/models')

// Thing under test
const { NewLicenceHelper } = require('../../helpers')

describe('New Licence helper', () => {
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    licence = await NewLicenceHelper.create(null, {
      debitLineCount: 5,
      subjectToMinimumChargeDebitValue: 5000
    })
  })

  describe('#create method', () => {
    it('updates the parent invoice', async () => {
      const result = await InvoiceModel.query().findById(licence.invoiceId)

      expect(result.debitLineCount).to.equal(5)
      expect(result.subjectToMinimumChargeDebitValue).to.equal(5000)
    })
  })

  describe('#update method', () => {
    it('adds supplied numbers to the existing licence values', async () => {
      const result = await NewLicenceHelper.update(licence, {
        debitLineCount: 1,
        subjectToMinimumChargeDebitValue: 1000
      })

      expect(result.debitLineCount).to.equal(6)
      expect(result.subjectToMinimumChargeDebitValue).to.equal(6000)
    })

    it('replaces existing licence strings', async () => {
      const result = await NewLicenceHelper.update(licence, {
        licenceNumber: 'NEW_REF'
      })

      expect(result.licenceNumber).to.equal('NEW_REF')
    })
  })
})
