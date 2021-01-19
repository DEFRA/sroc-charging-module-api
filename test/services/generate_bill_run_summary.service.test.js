'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, InvoiceHelper } = require('../support/helpers')
const { InvoiceModel } = require('../../app/models')

// Thing under test
const { GenerateBillRunSummaryService } = require('../../app/services')

describe('Bill Run service', () => {
  const authorisedSystemId = '6fd613d8-effb-4bcd-86c7-b0025d121692'
  const regimeId = '4206994c-5db9-4539-84a6-d4b6a671e2ba'
  const customerReference = 'A11111111A'

  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId)
    })

    it("sets the bill run status to 'generating_summary'", async () => {
      const result = await GenerateBillRunSummaryService.go(billRun.id)

      expect(result.status).to.equal('generating_summary')
    })

    describe('When there is a zero value invoice', () => {
      it("set 'summarised' flag to true", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 0, 0, 0, 0, 1)
        await GenerateBillRunSummaryService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })

      it("do not set non-zero value invoice 'summarised' flag to true", async () => {
        await InvoiceHelper.addInvoice(billRun.id, customerReference, 2020, 0, 0, 0, 0, 1)
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 1000, 1, 200, 1)
        await GenerateBillRunSummaryService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(false)
      })
    })

    describe('When there is a deminimis invoice', () => {
      it("set 'summarised' flag to true", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 600, 1, 300, 0)
        await GenerateBillRunSummaryService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })
    })

    describe('When there is no deminimis invoice', () => {
      it("leave 'summarised' flag as false", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 900, 1, 300, 0)
        await GenerateBillRunSummaryService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(false)
      })
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    const unknownBillRunId = '05f32bd9-7bce-42c2-8d6a-b14a8e26d531'

    describe('because no matching bill run exists', () => {
      it('throws an error', async () => {
        const err = await expect(GenerateBillRunSummaryService.go(unknownBillRunId)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
      })
    })
  })
})
