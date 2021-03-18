'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, GeneralHelper } = require('../support/helpers')

// Thing under test
const { BillRunModel } = require('../../app/models')

describe('Bill Run Model', () => {
  describe('the patchTally() class method', () => {
    let billRun

    beforeEach(async () => {
      await DatabaseHelper.clean()

      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
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

    it("returns 'false' when the status is 'generating'", async () => {
      const instance = BillRunModel.fromJson({ status: 'generating' })

      expect(instance.$editable()).to.be.false()
    })

    it("returns 'true' when the status is 'generated'", async () => {
      const instance = BillRunModel.fromJson({ status: 'generated' })

      expect(instance.$editable()).to.be.true()
    })

    it("returns 'true' when the status is 'approved'", async () => {
      const instance = BillRunModel.fromJson({ status: 'approved' })

      expect(instance.$editable()).to.be.true()
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
})
