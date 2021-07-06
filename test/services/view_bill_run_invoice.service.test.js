// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Thing under test
import ViewBillRunInvoiceService from '../../app/services/view_bill_run_invoice.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
