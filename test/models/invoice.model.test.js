'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  InvoiceHelper
} = require('../support/helpers')

// Thing under test
const { InvoiceModel } = require('../../app/models')

describe('Invoice Model', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  describe('Query modifiers', () => {
    describe('#Deminimis', () => {
      describe('when there is a mix of invoices', () => {
        let deminimisInvoice

        beforeEach(async () => {
          deminimisInvoice = await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 350, 0)
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 0, 0, 1, 501, 0) // debit more than 500
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000003', 2020, 1, 350, 0, 0, 0) // credit less than 500
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000004', 2020, 1, 501, 0, 0, 0) // credit more than 500
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000005', 2020, 0, 0, 0, 0, 1) // zero value
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000006', 2020, 0, 0, 1, 2500, 0, 1, 0, 2500) // minimum charge
        })

        it("only returns those which are 'deminimis'", async () => {
          const results = await InvoiceModel.query().modify('deminimis')

          expect(results.length).to.equal(1)
          expect(results[0].id).to.equal(deminimisInvoice.id)
        })
      })

      describe('when there no matching invoices', () => {
        beforeEach(async () => {
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 0, 0, 1, 501, 0) // debit more than 500
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000003', 2020, 1, 350, 0, 0, 0) // credit less than 500
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000004', 2020, 1, 501, 0, 0, 0) // credit more than 500
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000005', 2020, 0, 0, 0, 0, 1) // zero value
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000006', 2020, 0, 0, 1, 2500, 0, 1, 0, 2500) // minimum charge
        })

        it('returns nothing', async () => {
          const results = await InvoiceModel.query().modify('deminimis')

          expect(results.length).to.equal(0)
        })
      })

      describe("when there are only 'minimum charge' invoices", () => {
        beforeEach(async () => {
          // Minimum charge debit invoice
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 2500, 0, 1, 0, 2500)

          // Minimum charge credit invoice
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 1, 2500, 0, 0, 0, 1, 2500, 0)
        })

        it('returns nothing', async () => {
          const results = await InvoiceModel.query().modify('deminimis')

          expect(results.length).to.equal(0)
        })
      })
    })

    describe('#Billable', () => {
      describe('when there is a mix of invoices', () => {
        let billableInvoice

        beforeEach(async () => {
          billableInvoice = await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 501, 0)
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 0, 0, 1, 350, 0) // debit less than 500
          await InvoiceHelper.addInvoice(billRun.id, 'CMA0000003', 2020, 0, 0, 0, 0, 1) // zero value
        })

        it("only returns those which are 'billable'", async () => {
          const results = await InvoiceModel.query().modify('billable')

          expect(results.length).to.equal(1)
          expect(results[0].id).to.equal(billableInvoice.id)
        })
      })
    })
  })

  describe('$transactionType method', () => {
    it('returns C for a credit', async () => {
      const credit = await InvoiceHelper.addInvoice(billRun.id, 'CRD0000001', 2020, 1, 500, 0, 0, 0)

      const result = credit.$transactionType()

      expect(result).to.equal('C')
    })

    it('returns I for an invoice/debit', async () => {
      const debit = await InvoiceHelper.addInvoice(billRun.id, 'INV0000001', 2020, 0, 0, 1, 500, 0)

      const result = debit.$transactionType()

      expect(result).to.equal('I')
    })
  })
})
