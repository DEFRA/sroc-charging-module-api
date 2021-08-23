'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  InvoiceHelper,
  RegimeHelper
} = require('../support/helpers')

// Thing under test
const { FetchAndValidateInvoiceService } = require('../../app/services')

describe('Fetch and Validate Bill Run Invoice service', () => {
  let billRun
  let authorisedSystem
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    })

    describe('and a valid invoice ID', () => {
      it("returns the validated 'invoice'", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER REFERENCE', 2020)

        const result = await FetchAndValidateInvoiceService.go(billRun.id, invoice.id)

        expect(result.id).to.equal(invoice.id)
      })
    })

    describe('and an invalid invoice ID', () => {
      describe('because it is unknown', () => {
        it('throws an error', async () => {
          const unknownInvoiceId = GeneralHelper.uuid4()
          const err = await expect(FetchAndValidateInvoiceService.go(billRun.id, unknownInvoiceId)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
        })
      })
      describe('because it is not linked to the bill run', () => {
        it('throws an error', async () => {
          const otherBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
          const invoice = await InvoiceHelper.addInvoice(otherBillRun.id, 'CUSTOMER REFERENCE', 2020)
          const err = await expect(FetchAndValidateInvoiceService.go(billRun.id, invoice.id)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoice.id} is not linked to bill run ${billRun.id}.`
          )
        })
      })
    })
  })
})
