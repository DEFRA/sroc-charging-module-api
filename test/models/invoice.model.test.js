'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { InvoiceModel } = require('../../app/models')

describe('Bill Run Model', () => {
  describe('the $summarised() method', () => {
    it("returns 'true' when the status is 'summarised'", async () => {
      const instance = InvoiceModel.fromJson({ status: 'summarised' })

      expect(instance.$summarised()).to.be.true()
    })

    it("returns 'false' when the status is 'initialised'", async () => {
      const instance = InvoiceModel.fromJson({ status: 'initialised' })

      expect(instance.$summarised()).to.be.false()
    })

    it("returns 'false' when the status is 'generating'", async () => {
      const instance = InvoiceModel.fromJson({ status: 'generating' })

      expect(instance.$summarised()).to.be.false()
    })

    it("returns 'false' when the status is 'pending'", async () => {
      const instance = InvoiceModel.fromJson({ status: 'pending' })

      expect(instance.$summarised()).to.be.false()
    })

    it("returns 'false' when the status is 'billed'", async () => {
      const instance = InvoiceModel.fromJson({ status: 'billed' })

      expect(instance.$summarised()).to.be.false()
    })

    it("returns 'false' when the status is 'billing_not_required'", async () => {
      const instance = InvoiceModel.fromJson({ status: 'billing_not_required' })

      expect(instance.$summarised()).to.be.false()
    })
  })

  describe('the $zeroValue() method', () => {
    it("returns 'true' when all transactions are zero-value", async () => {
      const instance = InvoiceModel.fromJson({
        creditCount: 0,
        debitCount: 0,
        zeroCount: 1
      })

      expect(instance.$zeroValue()).to.be.true()
    })

    it("returns 'false' when there are credits and zero-value transactions", async () => {
      const instance = InvoiceModel.fromJson({
        creditCount: 1,
        debitCount: 0,
        zeroCount: 1
      })

      expect(instance.$zeroValue()).to.be.false()
    })

    it("returns 'false' when there are debits and zero-value transactions", async () => {
      const instance = InvoiceModel.fromJson({
        creditCount: 0,
        debitCount: 1,
        zeroCount: 1
      })

      expect(instance.$zeroValue()).to.be.false()
    })

    it("returns 'false' when there are credits and debits and there are zero-value transactions", async () => {
      const instance = InvoiceModel.fromJson({
        creditCount: 1,
        debitCount: 1,
        zeroCount: 1
      })

      expect(instance.$zeroValue()).to.be.false()
    })

    it("returns 'false' when there are credits but no zero-value transactions", async () => {
      const instance = InvoiceModel.fromJson({
        creditCount: 1,
        debitCount: 0,
        zeroCount: 0
      })

      expect(instance.$zeroValue()).to.be.false()
    })

    it("returns 'false' when there are debits but no zero-value transactions", async () => {
      const instance = InvoiceModel.fromJson({
        creditCount: 0,
        debitCount: 1,
        zeroCount: 0
      })

      expect(instance.$zeroValue()).to.be.false()
    })

    it("returns 'false' when there are credits and debits but no zero-value transactions", async () => {
      const instance = InvoiceModel.fromJson({
        creditCount: 1,
        debitCount: 1,
        zeroCount: 0
      })

      expect(instance.$zeroValue()).to.be.false()
    })
  })
})
