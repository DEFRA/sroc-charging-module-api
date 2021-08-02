'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper } = require('../../helpers')

// Thing under test
const { NewInvoiceHelper } = require('../../helpers')
const { BillRunModel } = require('../../../../app/models')

describe('New Invoice helper', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('#add method', () => {
    let invoice

    beforeEach(async () => {
      invoice = await NewInvoiceHelper.add(null, {
        debitLineCount: 5,
        subjectToMinimumChargeDebitValue: 5000
      })
    })

    it('updates the parent bill run', async () => {
      const billRun = await BillRunModel.query().findById(invoice.billRunId)

      expect(billRun.debitLineCount).to.equal(5)
      expect(billRun.subjectToMinimumChargeDebitValue).to.equal(5000)
    })
  })

  describe('#update method', () => {
    let invoice

    beforeEach(async () => {
      invoice = await NewInvoiceHelper.add(null, {
        debitLineCount: 1,
        subjectToMinimumChargeDebitValue: 1000
      })
    })

    it('adds supplied values to the existing invoice', async () => {
      const result = await NewInvoiceHelper.update(invoice, {
        debitLineCount: 5,
        subjectToMinimumChargeDebitValue: 5000
      })

      expect(result.debitLineCount).to.equal(6)
      expect(result.subjectToMinimumChargeDebitValue).to.equal(6000)
    })
  })
})
