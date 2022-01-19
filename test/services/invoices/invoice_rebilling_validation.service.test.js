'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  DatabaseHelper,
  NewBillRunHelper,
  NewInvoiceHelper,
  RegimeHelper
} = require('../../support/helpers')

// Thing under test
const { InvoiceRebillingValidationService } = require('../../../app/services')

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
      currentBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id, { region: 'A', status: 'billed' })
      newBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id)
    })

    describe('and a valid invoice ID', () => {
      it('returns `true`', async () => {
        const invoice = await NewInvoiceHelper.create(currentBillRun)

        const result = await InvoiceRebillingValidationService.go(newBillRun, invoice)

        expect(result).to.be.true()
      })

      describe('which is a rebill invoice', () => {
        it('returns `true`', async () => {
          const invoice = await NewInvoiceHelper.create(currentBillRun, { rebilledType: 'R' })

          const result = await InvoiceRebillingValidationService.go(newBillRun, invoice)

          expect(result).to.be.true()
        })
      })
    })

    describe('and an invalid invoice ID', () => {
      describe('because it already belongs to the specified bill run', () => {
        it('throws an error', async () => {
          const invoice = await NewInvoiceHelper.create(currentBillRun, { rebilledType: 'R' })

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
          const invalidCurrentBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id, { status: 'INVALID' })
          const invoice = await NewInvoiceHelper.create(invalidCurrentBillRun, { rebilledType: 'R' })

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
          const invoice = await NewInvoiceHelper.create(currentBillRun, { rebilledType: 'O' })
          await NewInvoiceHelper.create(currentBillRun, { rebilledType: 'R', rebilledInvoiceId: invoice.id })
          await NewInvoiceHelper.create(currentBillRun, { rebilledType: 'C', rebilledInvoiceId: invoice.id })

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
          const invoice = await NewInvoiceHelper.create(currentBillRun, { rebilledType: 'C' })

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
      currentBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id, { region: 'A', status: 'billed' })
    })

    describe("because its region does not match the invoice's current region", () => {
      it('throws an error', async () => {
        const invalidNewBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id, { region: 'B' })
        const invoice = await NewInvoiceHelper.create(currentBillRun)

        const err = await expect(
          InvoiceRebillingValidationService.go(invalidNewBillRun, invoice)
        ).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Invoice ${invoice.id} is for region A but bill run ${invalidNewBillRun.id} is for region B.`
        )
      })
    })

    describe("because its ruleset does not match the invoice's current ruleset", () => {
      it('throws an error', async () => {
        const invalidNewBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id, { ruleset: 'sroc' })
        const invoice = await NewInvoiceHelper.create(currentBillRun)

        const err = await expect(
          InvoiceRebillingValidationService.go(invalidNewBillRun, invoice)
        ).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Invoice ${invoice.id} is for ruleset presroc but bill run ${invalidNewBillRun.id} is for ruleset sroc.`
        )
      })
    })
  })
})
