'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  TransactionHelper
} = require('../../support/helpers')

// Thing under test
const { ViewInvoiceService } = require('../../../app/services')
const ViewInvoicePresrocService = require('../../../app/services/invoices/presroc/view_invoice_presroc.service')
const ViewInvoiceSrocService = require('../../../app/services/invoices/sroc/view_invoice_sroc.service')

describe.only('View Invoice service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  afterEach(async () => {
    Sinon.reset()
  })

  describe('When a valid bill run ID is supplied', () => {
    let billRun
    let invoiceId

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())

      await TransactionHelper.addTransaction(billRun.id)
      const transactions = await billRun.$relatedQuery('transactions')
      invoiceId = transactions[0].invoiceId
    })

    describe('and a valid invoice ID', () => {
      it('returns the expected response', async () => {
        const result = await ViewInvoiceService.go(billRun.id, invoiceId, 'sroc')

        expect(result.invoice.id).to.equal(invoiceId)
        expect(result.invoice.netTotal).to.equal(0)

        expect(result.invoice.licences).to.be.an.array()
        expect(result.invoice.licences[0].transactions).to.be.an.array()
        expect(result.invoice.licences[0].netTotal).to.equal(0)
      })

      describe('and sroc as ruleset', () => {
        it('calls the sroc service', async () => {
          const spy = Sinon.spy(ViewInvoiceSrocService, 'go')
          await ViewInvoiceService.go(billRun.id, invoiceId, 'sroc')

          expect(spy.calledOnce).to.be.true()
        })
      })

      describe('and presroc as ruleset', () => {
        it('calls the presroc service', async () => {
          const spy = Sinon.spy(ViewInvoicePresrocService, 'go')
          await ViewInvoiceService.go(billRun.id, invoiceId, 'presroc')

          expect(spy.calledOnce).to.be.true()
        })
      })
    })

    describe('and an invalid invoice ID', () => {
      describe('because it is unknown', () => {
        it('throws an error', async () => {
          const unknownInvoiceId = GeneralHelper.uuid4()
          const err = await expect(ViewInvoiceService.go(billRun.id, unknownInvoiceId, 'sroc')).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
        })
      })

      describe('because it is not linked to the bill run', () => {
        it('throws an error', async () => {
          const otherBillRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
          const err = await expect(ViewInvoiceService.go(otherBillRun.id, invoiceId, 'sroc')).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoiceId} is not linked to bill run ${otherBillRun.id}.`
          )
        })
      })
    })
  })
})
