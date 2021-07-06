// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import BillRunHelper from '../../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../../support/helpers/database.helper.js'
import GeneralHelper from '../../support/helpers/general.helper.js'
import InvoiceHelper from '../../support/helpers/invoice.helper.js'
import RegimeHelper from '../../support/helpers/regime.helper.js'

// Thing under test
import RequestInvoiceService from '../../../app/services/plugins/request_invoice.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Request invoice service', () => {
  let regime
  let invoice
  let billRun

  const invoicePath = id => {
    return `/test/wrls/bill-runs/_/invoices/${id}`
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe("When the request is 'invoice' related", () => {
    beforeEach(async () => {
      regime = await RegimeHelper.addRegime('wrls', 'WRLS')
      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)
      invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER', '2021')
    })

    describe('and is for a valid invoice', () => {
      it('returns the invoice', async () => {
        const result = await RequestInvoiceService.go(invoicePath(invoice.id), invoice.id)

        expect(result.id).to.equal(invoice.id)
      })
    })

    describe('but is for an invalid invoice', () => {
      describe('because no matching invoice exists', () => {
        it('returns null', async () => {
          const unknownInvoiceId = GeneralHelper.uuid4()
          const err = await expect(
            RequestInvoiceService.go(invoicePath(unknownInvoiceId), unknownInvoiceId)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
        })
      })
    })
  })

  describe("When the request isn't invoice related", () => {
    describe("because it's nothing to do with invoices", () => {
      it('returns null', async () => {
        const result = await RequestInvoiceService.go('/bill-runs/blah', GeneralHelper.uuid4())

        expect(result).to.be.null()
      })
    })
  })
})
