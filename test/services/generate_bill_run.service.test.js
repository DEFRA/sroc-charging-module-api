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
const { GenerateBillRunService } = require('../../app/services')

describe('Generate Bill Run Summary service', () => {
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

    it("sets the bill run status to 'generating'", async () => {
      const result = await GenerateBillRunService.go(billRun.id)

      expect(result.status).to.equal('generating')
    })

    describe('When there is a zero value invoice', () => {
      it("sets the 'summarised' flag to true", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 0, 0, 0, 0, 1)
        await GenerateBillRunService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })

      describe('and there is also a non-zero value invoice', () => {
        it("leaves the 'summarised' flag of the non-zero value invoice as false", async () => {
          await InvoiceHelper.addInvoice(billRun.id, customerReference, 2020, 0, 0, 0, 0, 1)
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 1000, 1, 200, 1)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })
    })

    describe('When deminimis applies', () => {
      it("sets the 'summarised' flag to true", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 600, 1, 300, 0)
        await GenerateBillRunService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })
    })

    describe('When deminimis does not apply', () => {
      describe('Because the invoice net value is over 500', () => {
        it("leaves the 'summarised' flag as false", async () => {
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 900, 1, 300, 0)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })

      describe('Because the invoice net value is under 0', () => {
        it("leaves the 'summarised' flag as false", async () => {
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 100, 1, 300, 0)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    describe('because no matching bill run exists', () => {
      it('throws an error', async () => {
        const unknownBillRunId = '05f32bd9-7bce-42c2-8d6a-b14a8e26d531'

        const err = await expect(GenerateBillRunService.go(unknownBillRunId)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
      })
    })

    describe('because the bill run is already generating', () => {
      it('throws an error', async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId, 'A', 'generating')
        const err = await expect(GenerateBillRunService.go(generatingBillRun.id)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${generatingBillRun.id} is already being generated`)
      })
    })

    describe('because the bill run is not editable', () => {
      it('throws an error', async () => {
        const notEditableStatus = 'NOT_EDITABLE'
        const notEditableBillRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId, 'A', notEditableStatus)
        const err = await expect(GenerateBillRunService.go(notEditableBillRun.id)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${notEditableBillRun.id} cannot be edited because its status is ${notEditableStatus}.`)
      })
    })
  })
})
