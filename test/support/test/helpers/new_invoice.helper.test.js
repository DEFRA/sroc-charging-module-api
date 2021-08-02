'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper } = require('../../helpers')
const { BillRunModel } = require('../../../../app/models')

// Thing under test
const { NewInvoiceHelper } = require('../../helpers')

describe('New Invoice helper', () => {
  let invoice

  beforeEach(async () => {
    await DatabaseHelper.clean()

    invoice = await NewInvoiceHelper.add(null, {
      debitLineCount: 5,
      subjectToMinimumChargeDebitValue: 5000
    })
  })

  describe('#add method', () => {
    it('updates the parent bill run', async () => {
      const result = await BillRunModel.query().findById(invoice.billRunId)

      expect(result.debitLineCount).to.equal(5)
      expect(result.subjectToMinimumChargeDebitValue).to.equal(5000)
    })
  })

  describe('#update method', () => {
    it('adds supplied values to the existing invoice', async () => {
      const result = await NewInvoiceHelper.update(invoice, {
        debitLineCount: 1,
        subjectToMinimumChargeDebitValue: 1000
      })

      expect(result.debitLineCount).to.equal(6)
      expect(result.subjectToMinimumChargeDebitValue).to.equal(6000)
    })
  })
})
