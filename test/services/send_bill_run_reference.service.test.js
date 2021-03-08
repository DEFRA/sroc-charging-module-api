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
  InvoiceHelper,
  RegimeHelper,
  SequenceCounterHelper
} = require('../support/helpers')

// Thing under test
const { SendBillRunReferenceService } = require('../../app/services')

describe('Send Bill Run Reference service', () => {
  let regime
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(regime.id, GeneralHelper.uuid4())
    await SequenceCounterHelper.addSequenceCounter(regime.id, billRun.region)
  })

  describe("When the 'bill run' can be sent", () => {
    beforeEach(async () => {
      billRun.status = 'approved'
    })

    it("sets the 'bill run' status to 'pending'", async () => {
      await SendBillRunReferenceService.go(regime, billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun.status).to.equal('pending')
    })

    it("generates a file reference for the 'bill run'", async () => {
      await SendBillRunReferenceService.go(regime, billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun.fileReference).to.equal('nalai50001')
    })

    describe("for each 'invoice' linked to the bill run", () => {
      beforeEach(async () => {
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 350, 0) // deminimis debit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 0, 0, 1, 501, 0) // standard debit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000003', 2020, 1, 350, 0, 0, 0) // standard credit < deminimis
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000004', 2020, 1, 501, 0, 0, 0) // standard credit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000005', 2020, 0, 0, 0, 0, 1) // zero value
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000006', 2020, 0, 0, 1, 501, 0, 1, 0, 501) // std minimum charge
      })

      it("generates and assigns a 'transaction reference' to only the billable invoices", async () => {
        await SendBillRunReferenceService.go(regime, billRun)

        const invoices = await billRun.$relatedQuery('invoices')
        const updatedInvoices = invoices
          .filter(invoice => invoice.transactionReference)
          .map(invoice => invoice.customerReference)
        const billableInvoices = ['CMA0000002', 'CMA0000003', 'CMA0000004', 'CMA0000006']

        expect(updatedInvoices).to.only.include(billableInvoices)
      })
    })

    describe("but none of its invoices are 'billable'", () => {
      beforeEach(async () => {
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 350, 0) // deminimis debit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 0, 0, 0, 0, 1) // zero value
      })

      it("still updates the status to 'pending'", async () => {
        await SendBillRunReferenceService.go(regime, billRun)

        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun.status).to.equal('pending')
      })

      it("it does not assign a 'file reference'", async () => {
        await SendBillRunReferenceService.go(regime, billRun)

        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun.fileReference).to.be.null()
      })
    })
  })

  describe("When the 'bill run' cannot be sent", () => {
    describe("because the status is not 'approved'", () => {
      it('throws an error', async () => {
        const err = await expect(SendBillRunReferenceService.go(regime, billRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${billRun.id} does not have a status of 'approved'.`)
      })
    })
  })
})
