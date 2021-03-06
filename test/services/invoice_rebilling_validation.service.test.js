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
  InvoiceHelper,
  RegimeHelper
} = require('../support/helpers')

// Thing under test
const { InvoiceRebillingValidationService } = require('../../app/services')

describe('Invoice Rebilling Validation service', () => {
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
      it('returns `true`', async () => {
        const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER REFERENCE', 2020)

        const result = await InvoiceRebillingValidationService.go(newBillRun, invoice)

        expect(result).to.be.true()
      })

      describe('which is a rebill invoice', () => {
        it('returns `true`', async () => {
          const invoice = await InvoiceHelper.addInvoice(
            currentBillRun.id, 'CUSTOMER REFERENCE', 2020, 0, 0, 0, 0, 0, 0, 0, 0, null, 'R'
          )

          const result = await InvoiceRebillingValidationService.go(newBillRun, invoice)

          expect(result).to.be.true()
        })
      })
    })

    describe('and an invalid invoice ID', () => {
      describe('because it already belongs to the specified bill run', () => {
        it('throws an error', async () => {
          const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER REFERENCE', 2020)

          const err = await expect(
            InvoiceRebillingValidationService.go(currentBillRun, invoice)
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
            InvoiceRebillingValidationService.go(newBillRun, invoice)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Bill run ${invalidCurrentBillRun.id} does not have a status of 'billed'.`
          )
        })
      })

      describe('because it is already being rebilled', () => {
        it('throws an error', async () => {
          const invoice = await InvoiceHelper.addInvoice(
            currentBillRun.id, 'CUSTOMER REFERENCE', 2020, 0, 0, 0, 0, 0, 0, 0, 0, null, 'O'
          )
          await InvoiceHelper.addInvoice(
            currentBillRun.id, 'CUSTOMER REFERENCE', 2020, 0, 0, 0, 0, 0, 0, 0, 0, invoice.id, 'R'
          )
          await InvoiceHelper.addInvoice(
            currentBillRun.id, 'CUSTOMER REFERENCE', 2020, 0, 0, 0, 0, 0, 0, 0, 0, invoice.id, 'C'
          )

          const err = await expect(
            InvoiceRebillingValidationService.go(newBillRun, invoice)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoice.id} has already been rebilled.`
          )
        })
      })

      describe('because it is a rebill cancel invoice', () => {
        it('throws an error', async () => {
          const invoice = await InvoiceHelper.addInvoice(
            currentBillRun.id, 'CUSTOMER REFERENCE', 2020, 0, 0, 0, 0, 0, 0, 0, 0, null, 'C'
          )

          const err = await expect(
            InvoiceRebillingValidationService.go(newBillRun, invoice)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoice.id} is a rebill cancel invoice and cannot be rebilled.`
          )
        })
      })
    })
  })

  describe('When an invalid bill run is supplied', () => {
    beforeEach(async () => {
      currentBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'billed')
    })

    describe("because its region does not match the invoice's current region", () => {
      it('throws an error', async () => {
        const invalidNewBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'B')
        const invoice = await InvoiceHelper.addInvoice(currentBillRun.id, 'CUSTOMER REFERENCE', 2020)

        const err = await expect(
          InvoiceRebillingValidationService.go(invalidNewBillRun, invoice)
        ).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Invoice ${invoice.id} is for region A but bill run ${invalidNewBillRun.id} is for region B.`
        )
      })
    })
  })
})
