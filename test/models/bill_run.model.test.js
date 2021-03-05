'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { BillRunModel } = require('../../app/models')

describe('Bill Run Model', () => {
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
