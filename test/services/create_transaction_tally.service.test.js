'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { RawBuilder } = require('objection/lib/queryBuilder/RawBuilder')

// Thing under test
const { CreateTransactionTallyService } = require('../../app/services')

describe('Create Transaction Tally service', () => {
  let transaction

  beforeEach(() => {
    transaction = {
      chargeCredit: false,
      chargeValue: 10
    }
  })

  describe("When the transaction is a 'debit'", () => {
    it("only includes 'debit' properties", async () => {
      const result = await CreateTransactionTallyService.go(transaction)

      expect(result).to.only.include(['debitLineCount', 'debitLineValue'])
    })

    it("has correctly configured instances of 'Objection RawBuilder'", async () => {
      const result = await CreateTransactionTallyService.go(transaction)

      expect(result.debitLineCount).to.be.an.instanceOf(RawBuilder)
      expect(result.debitLineCount._sql.toLowerCase()).to.equal('debit_line_count + ?')
      expect(result.debitLineCount._args[0]).to.equal(1)

      expect(result.debitLineValue).to.be.an.instanceOf(RawBuilder)
      expect(result.debitLineValue._sql.toLowerCase()).to.equal('debit_line_value + ?')
      expect(result.debitLineValue._args[0]).to.equal(transaction.chargeValue)
    })

    describe("and 'subject to minimum charge'", () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      it("only includes 'debit' properties and 'subjectToMinimumChargeCount'", async () => {
        const result = await CreateTransactionTallyService.go(transaction)

        expect(result).to.only.include([
          'debitLineCount',
          'debitLineValue',
          'subjectToMinimumChargeCount',
          'subjectToMinimumChargeDebitValue'
        ])
      })

      it("has correctly configured instances of 'Objection RawBuilder'", async () => {
        const result = await CreateTransactionTallyService.go(transaction)

        expect(result.debitLineCount).to.be.an.instanceOf(RawBuilder)
        expect(result.debitLineCount._sql.toLowerCase()).to.equal('debit_line_count + ?')
        expect(result.debitLineCount._args[0]).to.equal(1)

        expect(result.debitLineValue).to.be.an.instanceOf(RawBuilder)
        expect(result.debitLineValue._sql.toLowerCase()).to.equal('debit_line_value + ?')
        expect(result.debitLineValue._args[0]).to.equal(transaction.chargeValue)

        expect(result.subjectToMinimumChargeCount).to.be.an.instanceOf(RawBuilder)
        expect(result.subjectToMinimumChargeCount._sql.toLowerCase()).to.equal('subject_to_minimum_charge_count + ?')
        expect(result.subjectToMinimumChargeCount._args[0]).to.equal(1)

        expect(result.subjectToMinimumChargeDebitValue).to.be.an.instanceOf(RawBuilder)
        expect(result.subjectToMinimumChargeDebitValue._sql.toLowerCase())
          .to.equal('subject_to_minimum_charge_debit_value + ?')
        expect(result.subjectToMinimumChargeDebitValue._args[0]).to.equal(transaction.chargeValue)
      })
    })
  })

  describe("When the transaction is a 'credit'", () => {
    beforeEach(() => {
      transaction.chargeCredit = true
    })

    it("only includes 'credit' properties", async () => {
      const result = await CreateTransactionTallyService.go(transaction)

      expect(result).to.only.include(['creditLineCount', 'creditLineValue'])
    })

    it("has correctly configured instances of 'Objection RawBuilder'", async () => {
      const result = await CreateTransactionTallyService.go(transaction)

      expect(result.creditLineCount).to.be.an.instanceOf(RawBuilder)
      expect(result.creditLineCount._sql.toLowerCase()).to.equal('credit_line_count + ?')
      expect(result.creditLineCount._args[0]).to.equal(1)

      expect(result.creditLineValue).to.be.an.instanceOf(RawBuilder)
      expect(result.creditLineValue._sql.toLowerCase()).to.equal('credit_line_value + ?')
      expect(result.creditLineValue._args[0]).to.equal(transaction.chargeValue)
    })

    describe("and 'subject to minimum charge'", () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      it("only includes 'credit' properties and 'subjectToMinimumChargeCount'", async () => {
        const result = await CreateTransactionTallyService.go(transaction)

        expect(result).to.only.include([
          'creditLineCount',
          'creditLineValue',
          'subjectToMinimumChargeCount',
          'subjectToMinimumChargeCreditValue'
        ])
      })

      it("has correctly configured instances of 'Objection RawBuilder'", async () => {
        const result = await CreateTransactionTallyService.go(transaction)

        expect(result.creditLineCount).to.be.an.instanceOf(RawBuilder)
        expect(result.creditLineCount._sql.toLowerCase()).to.equal('credit_line_count + ?')
        expect(result.creditLineCount._args[0]).to.equal(1)

        expect(result.creditLineValue).to.be.an.instanceOf(RawBuilder)
        expect(result.creditLineValue._sql.toLowerCase()).to.equal('credit_line_value + ?')
        expect(result.creditLineValue._args[0]).to.equal(transaction.chargeValue)

        expect(result.subjectToMinimumChargeCount).to.be.an.instanceOf(RawBuilder)
        expect(result.subjectToMinimumChargeCount._sql.toLowerCase()).to.equal('subject_to_minimum_charge_count + ?')
        expect(result.subjectToMinimumChargeCount._args[0]).to.equal(1)

        expect(result.subjectToMinimumChargeCreditValue).to.be.an.instanceOf(RawBuilder)
        expect(result.subjectToMinimumChargeCreditValue._sql.toLowerCase())
          .to.equal('subject_to_minimum_charge_credit_value + ?')
        expect(result.subjectToMinimumChargeCreditValue._args[0]).to.equal(transaction.chargeValue)
      })
    })
  })

  describe("When the transaction is 'zero value'", () => {
    beforeEach(() => {
      transaction.chargeValue = 0
    })

    it("only includes 'zero value' properties", async () => {
      const result = await CreateTransactionTallyService.go(transaction)

      expect(result).to.only.include(['zeroLineCount'])
    })

    it("has correctly configured instances of 'Objection RawBuilder'", async () => {
      const result = await CreateTransactionTallyService.go(transaction)

      expect(result.zeroLineCount).to.be.an.instanceOf(RawBuilder)
      expect(result.zeroLineCount._sql.toLowerCase()).to.equal('zero_line_count + ?')
      expect(result.zeroLineCount._args[0]).to.equal(1)
    })

    describe("and 'subject to minimum charge'", () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      it("only includes 'zero value' properties and 'subjectToMinimumChargeCount'", async () => {
        const result = await CreateTransactionTallyService.go(transaction)

        expect(result).to.only.include(['zeroLineCount', 'subjectToMinimumChargeCount'])
      })

      it("has correctly configured instances of 'Objection RawBuilder'", async () => {
        const result = await CreateTransactionTallyService.go(transaction)

        expect(result.zeroLineCount).to.be.an.instanceOf(RawBuilder)
        expect(result.zeroLineCount._sql.toLowerCase()).to.equal('zero_line_count + ?')
        expect(result.zeroLineCount._args[0]).to.equal(1)

        expect(result.subjectToMinimumChargeCount).to.be.an.instanceOf(RawBuilder)
        expect(result.subjectToMinimumChargeCount._sql.toLowerCase()).to.equal('subject_to_minimum_charge_count + ?')
        expect(result.subjectToMinimumChargeCount._args[0]).to.equal(1)
      })
    })
  })
})
