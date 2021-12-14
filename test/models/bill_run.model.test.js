'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  DatabaseHelper,
  NewBillRunHelper,
  NewInvoiceHelper
} = require('../support/helpers')

// Thing under test
const { BillRunModel } = require('../../app/models')

describe('Bill Run Model', () => {
  describe('the patchTally() class method', () => {
    let billRun

    beforeEach(async () => {
      await DatabaseHelper.clean()

      billRun = await NewBillRunHelper.create()
    })

    it("updates the 'tally' fields for the matching bill run", async () => {
      const transaction = {
        billRunId: billRun.id,
        chargeCredit: false,
        chargeValue: 100,
        subjectToMinimumCharge: false
      }

      const id = await BillRunModel.patchTally(transaction)
      const refreshedBillRun = await billRun.$query()

      expect(id).to.equal(refreshedBillRun.id)
      expect(refreshedBillRun.debitLineCount).to.equal(1)
      expect(refreshedBillRun.debitLineValue).to.equal(transaction.chargeValue)
      expect(refreshedBillRun.subjectToMinimumChargeCount).to.equal(0)
    })
  })

  describe('the $editable() method', () => {
    it("returns 'true' when the status is 'initialised'", async () => {
      const instance = BillRunModel.fromJson({ status: 'initialised' })

      expect(instance.$editable()).to.be.true()
    })

    it("returns 'true' when the status is 'generated'", async () => {
      const instance = BillRunModel.fromJson({ status: 'generated' })

      expect(instance.$editable()).to.be.true()
    })

    it("returns 'false' when the status is 'approved'", async () => {
      const instance = BillRunModel.fromJson({ status: 'approved' })

      expect(instance.$editable()).to.be.false()
    })

    it("returns 'false' when the status is 'pending'", async () => {
      const instance = BillRunModel.fromJson({ status: 'pending' })

      expect(instance.$editable()).to.be.false()
    })

    it("returns 'false' when the status is 'billed'", async () => {
      const instance = BillRunModel.fromJson({ status: 'billed' })

      expect(instance.$editable()).to.be.false()
    })

    it("returns 'false' when the status is 'billing_not_required'", async () => {
      const instance = BillRunModel.fromJson({ status: 'billing_not_required' })

      expect(instance.$editable()).to.be.false()
    })

    it("returns 'false' when the status is 'deleting'", async () => {
      const instance = BillRunModel.fromJson({ status: 'deleting' })

      expect(instance.$editable()).to.be.false()
    })
  })

  describe('the $patchable() method', () => {
    it("returns 'true' when the status is 'initialised'", async () => {
      const instance = BillRunModel.fromJson({ status: 'initialised' })

      expect(instance.$patchable()).to.be.true()
    })

    it("returns 'true' when the status is 'generated'", async () => {
      const instance = BillRunModel.fromJson({ status: 'generated' })

      expect(instance.$patchable()).to.be.true()
    })

    it("returns 'true' when the status is 'approved'", async () => {
      const instance = BillRunModel.fromJson({ status: 'approved' })

      expect(instance.$patchable()).to.be.true()
    })

    it("returns 'false' when the status is 'pending'", async () => {
      const instance = BillRunModel.fromJson({ status: 'pending' })

      expect(instance.$patchable()).to.be.false()
    })

    it("returns 'false' when the status is 'billed'", async () => {
      const instance = BillRunModel.fromJson({ status: 'billed' })

      expect(instance.$patchable()).to.be.false()
    })

    it("returns 'false' when the status is 'billing_not_required'", async () => {
      const instance = BillRunModel.fromJson({ status: 'billing_not_required' })

      expect(instance.$patchable()).to.be.false()
    })

    it("returns 'false' when the status is 'deleting'", async () => {
      const instance = BillRunModel.fromJson({ status: 'deleting' })

      expect(instance.$patchable()).to.be.false()
    })
  })

  describe('the $approved() method', () => {
    it("returns 'true' when the status is 'approved'", async () => {
      const instance = BillRunModel.fromJson({ status: 'approved' })

      expect(instance.$approved()).to.be.true()
    })

    it("returns 'false' when the status is something else", async () => {
      const instance = BillRunModel.fromJson({ status: 'initialised' })

      expect(instance.$approved()).to.be.false()
    })
  })

  describe('the $deminimisLimit() method', () => {
    it("returns the deminimis limit for the bill run's ruleset", async () => {
      const instance = BillRunModel.fromJson({ ruleset: 'presroc' })

      expect(instance.$deminimisLimit()).to.equal(500)
    })
  })

  describe('the $deminimisInvoices() method', () => {
    let deminimisBillRun

    describe('for a presroc bill run', () => {
      let deminimisInvoice

      beforeEach(async () => {
        deminimisBillRun = await NewBillRunHelper.create(null, null, { ruleset: 'presroc' })

        // Add a deminimis invoice to the bill run (value of 400 is within the deminimis limit)
        deminimisInvoice = await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'DEM', debitLineValue: 500, creditLineValue: 100 })
        // Add a non-deminimis invoice (value of 900 is over the presroc deminimis limit)
        await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'NOT_DEM_1', debitLineValue: 1000, creditLineValue: 100 })
        // Add a non-deminimis invoice (value of 1500 is over both presroc and sroc deminimis limits)
        await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'NOT_DEM_2', debitLineValue: 1500 })
        // Add a non-deminimis invoice (value is within deminimis limit but rebill invoices are not subject to deminimis)
        await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'NOT_DEM_3', debitLineValue: 500, creditLineValue: 100, rebilledType: 'R' })
      })

      it('returns all invoices which are deminimis', async () => {
        const result = await deminimisBillRun.$deminimisInvoices()

        expect(result.length).to.equal(1)
        expect(result).to.only.contain(deminimisInvoice)
      })
    })

    describe('for an sroc bill run', () => {
      let firstDeminimisInvoice
      let secondDeminimisInvoice

      beforeEach(async () => {
        deminimisBillRun = await NewBillRunHelper.create(null, null, { ruleset: 'sroc' })

        // Add a deminimis invoice to the bill run (value of 400 is within the deminimis limit)
        firstDeminimisInvoice = await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'DEM_1', debitLineValue: 500, creditLineValue: 100 })
        // Add a deminimis invoice to the bill run (value of 900 is within the sroc deminimis limit)
        secondDeminimisInvoice = await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'DEM_2', debitLineValue: 1000, creditLineValue: 100 })
        // Add a non-deminimis invoice (value of 1500 is over both presroc and sroc deminimis limits)
        await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'NOT_DEM_1', debitLineValue: 1500 })
        // Add a non-deminimis invoice (value is within deminimis limit but rebill invoices are not subject to deminimis)
        await NewInvoiceHelper.create(deminimisBillRun, { customerReference: 'NOT_DEM_2', debitLineValue: 500, creditLineValue: 100, rebilledType: 'R' })
      })

      it('returns all invoices which are deminimis', async () => {
        const result = await deminimisBillRun.$deminimisInvoices()

        expect(result.length).to.equal(2)
        expect(result).to.only.contain([firstDeminimisInvoice, secondDeminimisInvoice])
      })
    })
  })
})
