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
  TransactionHelper
} = require('../support/helpers')

// Thing under test
const { ViewBillRunInvoiceService } = require('../../app/services')

describe('View bill run service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
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
        const result = await ViewBillRunInvoiceService.go(billRun.id, invoiceId)

        expect(result.invoice.id).to.equal(invoiceId)
        expect(result.invoice.netTotal).to.equal(0)

        expect(result.invoice.licences).to.be.an.array()
        expect(result.invoice.licences[0].transactions).to.be.an.array()
        expect(result.invoice.licences[0].netTotal).to.equal(0)
      })
    })

    describe('and an invalid invoice ID', () => {
      describe('because it is unknown', () => {
        it('throws an error', async () => {
          const unknownInvoiceId = GeneralHelper.uuid4()
          const err = await expect(ViewBillRunInvoiceService.go(billRun.id, unknownInvoiceId)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
        })
      })

      describe('because it is not linked to the bill run', () => {
        it('throws an error', async () => {
          const otherBillRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
          const err = await expect(ViewBillRunInvoiceService.go(otherBillRun.id, invoiceId)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoiceId} is not linked to bill run ${otherBillRun.id}.`
          )
        })
      })
    })
  })
})
