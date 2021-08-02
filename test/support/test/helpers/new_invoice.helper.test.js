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

describe('New Invoice helper', () => {
  let invoice

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('#update method', () => {
    beforeEach(async () => {
      invoice = await NewInvoiceHelper.add()
    })

    it('adds supplied values to the existing invoice', async () => {
      const result = await NewInvoiceHelper.update(invoice, {
        debitLineCount: 5,
        subjectToMinimumChargeDebitValue: 5000
      })

      expect(result.debitLineCount).to.equal(5)
      expect(result.subjectToMinimumChargeDebitValue).to.equal(5000)
    })
  })
})
