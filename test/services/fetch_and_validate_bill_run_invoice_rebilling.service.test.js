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
const { FetchAndValidateBillRunInvoiceRebillingService } = require('../../app/services')

describe('Fetch and Validate Bill Run Invoice Rebilling service', () => {
  let currentBillRun
  let newBillRun
  let authorisedSystem
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
  })

  describe('When a valid bill run is supplied', () => {
    beforeEach(async () => {
      currentBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'billed')
      newBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    })

    describe('and a valid invoice ID', () => {
      it("returns the validated 'invoice'", async () => {
        const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER REFERENCE', 2020)

        const result = await FetchAndValidateBillRunInvoiceRebillingService.go(newBillRun, invoice.id)

        expect(result.id).to.equal(invoice.id)
      })
    })

    describe('and an invalid invoice ID', () => {
      describe('because it is unknown', () => {
        it('throws an error', async () => {
          const unknownInvoiceId = GeneralHelper.uuid4()

          const err = await expect(
            FetchAndValidateBillRunInvoiceRebillingService.go(newBillRun, unknownInvoiceId)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
        })
      })

      describe('because it already belongs to the specified bill run', () => {
        it('throws an error', async () => {
          const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER REFERENCE', 2020)

          const err = await expect(
            FetchAndValidateBillRunInvoiceRebillingService.go(currentBillRun, invoice.id)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoice.id} is already on bill run ${currentBillRun.id}.`
          )
        })
      })

      describe('because the status of its bill run is not valid', () => {
        it('throws an error', async () => {
          const invalidCurrentBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'INVALID')
          const invoice = await InvoiceHelper.addInvoice(invalidCurrentBillRun.id, 'CUSTOMER REFERENCE', 2020)

          const err = await expect(
            FetchAndValidateBillRunInvoiceRebillingService.go(newBillRun, invoice.id)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Bill run ${invalidCurrentBillRun.id} does not have a status of 'billed'.`
          )
        })
      })
    })
  })

  describe('When an invalid bill run is supplied', () => {
    beforeEach(async () => {
      currentBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'billed')
    })

    describe('because its status is not valid', () => {
      it('throws an error', async () => {
        const invalidNewBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'INVALID')
        const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER REFERENCE', 2020)

        const err = await expect(
          FetchAndValidateBillRunInvoiceRebillingService.go(invalidNewBillRun, invoice.id)
        ).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Bill run ${invalidNewBillRun.id} has a status of '${invalidNewBillRun.status}'.`
        )
      })
    })

    describe("because its region does not match the invoice's current region", () => {
      it('throws an error', async () => {
        const invalidNewBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'B')
        const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER REFERENCE', 2020)

        const err = await expect(
          FetchAndValidateBillRunInvoiceRebillingService.go(invalidNewBillRun, invoice.id)
        ).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Invoice ${invoice.id} is for region A but bill run ${invalidNewBillRun.id} is for region B.`
        )
      })
    })
  })
})
