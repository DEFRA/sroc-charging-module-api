'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../helpers/database.helper.js')
const BillRunModel = require('../../../../app/models/bill_run.model.js')

// Thing under test
const NewInvoiceHelper = require('../../helpers/new_invoice.helper.js')

describe('New Invoice helper', () => {
  let invoice

  beforeEach(async () => {
    await DatabaseHelper.clean()

    invoice = await NewInvoiceHelper.create(null, {
      debitLineCount: 5,
      debitLineValue: 250,
      financialYear: 2021,
      deminimisInvoice: false,
      zeroValueInvoice: true
    })
  })

  describe('#create method', () => {
    it('sets flags as requested', async () => {
      expect(invoice.deminimisInvoice).to.be.false()
      expect(invoice.zeroValueInvoice).to.be.true()
    })

    it('updates the parent bill run', async () => {
      const result = await BillRunModel.query().findById(invoice.billRunId)

      expect(result.debitLineCount).to.equal(5)
      expect(result.debitLineValue).to.equal(250)
    })
  })

  describe('#update method', () => {
    it('adds supplied numbers to the existing invoice values', async () => {
      const result = await NewInvoiceHelper.update(invoice, {
        debitLineCount: 1,
        debitLineValue: 1000
      })

      expect(result.debitLineCount).to.equal(6)
      expect(result.debitLineValue).to.equal(1250)
    })

    it('replaces existing invoice strings and booleans', async () => {
      const result = await NewInvoiceHelper.update(invoice, {
        customerReference: 'NEW_REF',
        deminimisInvoice: true
      })

      expect(result.customerReference).to.equal('NEW_REF')
      expect(result.deminimisInvoice).to.be.true()
    })

    it('replaces financial year', async () => {
      const result = await NewInvoiceHelper.update(invoice, {
        financialYear: 3000
      })

      expect(result.financialYear).to.equal(3000)
    })

    it('updates values at the bill run level', async () => {
      await NewInvoiceHelper.update(invoice, {
        debitLineCount: 1,
        debitLineValue: 1000
      })
      const result = await BillRunModel.query().findById(invoice.billRunId)

      expect(result.debitLineCount).to.equal(6)
      expect(result.debitLineValue).to.equal(1250)
    })
  })

  describe('#refreshFlags method', () => {
    it('sets flags based on current counts and values', async () => {
      const result = await NewInvoiceHelper.refreshFlags(invoice)

      expect(result.deminimisInvoice).to.be.true()
      expect(result.zeroValueInvoice).to.be.false()
    })
  })
})
