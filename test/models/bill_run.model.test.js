// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'

// Thing under test
import BillRunModel from '../../app/models/bill_run.model.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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

    it("returns 'false' when the status is 'generating'", async () => {
      const instance = BillRunModel.fromJson({ status: 'generating' })

      expect(instance.$patchable()).to.be.false()
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
})
