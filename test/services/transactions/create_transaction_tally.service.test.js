'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { RawBuilder } = require('objection/lib/queryBuilder/RawBuilder')

// Thing under test
const { CreateTransactionTallyService } = require('../../../app/services')

describe('Create Transaction Tally service', () => {
  const tableName = 'widgets'
  let transaction

  beforeEach(() => {
    transaction = {
      chargeCredit: false,
      chargeValue: 10
    }
  })

  describe("When the transaction is a 'debit'", () => {
    describe("the 'insertData' property of the returned 'tallyObject'", () => {
      it("only includes 'debit' properties", () => {
        const insertData = CreateTransactionTallyService.go(transaction, tableName).insertData

        expect(insertData).to.only.include(['debitLineCount', 'debitLineValue'])
      })
    })

    describe("the 'updateStatements' property of the returned 'tallyObject'", () => {
      it("only includes 'debit' statements", () => {
        const updateStatements = CreateTransactionTallyService.go(transaction, tableName).updateStatements

        expect(updateStatements).to.be.length(2)
        expect(updateStatements[0]).to.startWith('debit_line_count')
        expect(updateStatements[1]).to.startWith('debit_line_value')
      })
    })

    describe("the 'patch' property of the returned 'tallyObject'", () => {
      it("has correctly configured instances of 'Objection RawBuilder'", () => {
        const patch = CreateTransactionTallyService.go(transaction, tableName).patch

        expect(patch.debitLineCount).to.be.an.instanceOf(RawBuilder)
        // Adding this comment to the first instance we do this. We lowercase() the value before asserting it matches
        // because of inconsistencies we found in knex's camel to snake case conversion. In our tests `debitLineValue`
        // was getting converted to `debit_Line_value`. Rather than update our test to match the inconsistency we have
        // chosen to lowercase everything before comparing. The case does not matter to the final query, and we feel this
        // will make our tests less brittle should it get fixed, or other examples arise.
        expect(patch.debitLineCount._sql.toLowerCase()).to.equal('debit_line_count + ?')
        expect(patch.debitLineCount._args[0]).to.equal(1)

        expect(patch.debitLineValue).to.be.an.instanceOf(RawBuilder)
        expect(patch.debitLineValue._sql.toLowerCase()).to.equal('debit_line_value + ?')
        expect(patch.debitLineValue._args[0]).to.equal(transaction.chargeValue)
      })
    })

    describe("and 'subject to minimum charge'", () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      describe("the 'insertData' property of the returned 'tallyObject'", () => {
        it("only includes 'debit' and 'subjectToMinimumCharge' properties", () => {
          const insertData = CreateTransactionTallyService.go(transaction, tableName).insertData

          expect(insertData).to.only.include([
            'debitLineCount',
            'debitLineValue',
            'subjectToMinimumChargeCount',
            'subjectToMinimumChargeDebitValue'
          ])
        })
      })

      describe("the 'updateStatements' property of the returned 'tallyObject'", () => {
        it("only includes 'debit' and 'subjectToMinimumCharge' statements", () => {
          const updateStatements = CreateTransactionTallyService.go(transaction, tableName).updateStatements

          expect(updateStatements).to.be.length(4)
          expect(updateStatements[0]).to.startWith('debit_line_count')
          expect(updateStatements[1]).to.startWith('debit_line_value')
          expect(updateStatements[2]).to.startWith('subject_to_minimum_charge_count')
          expect(updateStatements[3]).to.startWith('subject_to_minimum_charge_debit_value')
        })
      })

      describe("the 'patch' property of the returned 'tallyObject'", () => {
        it("has correctly configured instances of 'Objection RawBuilder'", () => {
          const patch = CreateTransactionTallyService.go(transaction, tableName).patch

          expect(patch.debitLineCount).to.be.an.instanceOf(RawBuilder)
          expect(patch.debitLineCount._sql.toLowerCase()).to.equal('debit_line_count + ?')
          expect(patch.debitLineCount._args[0]).to.equal(1)

          expect(patch.debitLineValue).to.be.an.instanceOf(RawBuilder)
          expect(patch.debitLineValue._sql.toLowerCase()).to.equal('debit_line_value + ?')
          expect(patch.debitLineValue._args[0]).to.equal(transaction.chargeValue)

          expect(patch.subjectToMinimumChargeCount).to.be.an.instanceOf(RawBuilder)
          expect(patch.subjectToMinimumChargeCount._sql.toLowerCase()).to.equal('subject_to_minimum_charge_count + ?')
          expect(patch.subjectToMinimumChargeCount._args[0]).to.equal(1)

          expect(patch.subjectToMinimumChargeDebitValue).to.be.an.instanceOf(RawBuilder)
          expect(patch.subjectToMinimumChargeDebitValue._sql.toLowerCase())
            .to.equal('subject_to_minimum_charge_debit_value + ?')
          expect(patch.subjectToMinimumChargeDebitValue._args[0]).to.equal(transaction.chargeValue)
        })
      })
    })
  })

  describe("When the transaction is a 'credit'", () => {
    beforeEach(() => {
      transaction.chargeCredit = true
    })

    describe("the 'insertData' property of the returned 'tallyObject'", () => {
      it("only includes 'credit' properties", () => {
        const insertData = CreateTransactionTallyService.go(transaction, tableName).insertData

        expect(insertData).to.only.include(['creditLineCount', 'creditLineValue'])
      })
    })

    describe("the 'updateStatements' property of the returned 'tallyObject'", () => {
      it("only includes 'credit' statements", () => {
        const updateStatements = CreateTransactionTallyService.go(transaction, tableName).updateStatements

        expect(updateStatements).to.be.length(2)
        expect(updateStatements[0]).to.startWith('credit_line_count')
        expect(updateStatements[1]).to.startWith('credit_line_value')
      })
    })

    describe("the 'patch' property of the returned 'tallyObject'", () => {
      it("has correctly configured instances of 'Objection RawBuilder'", () => {
        const patch = CreateTransactionTallyService.go(transaction, tableName).patch

        expect(patch.creditLineCount).to.be.an.instanceOf(RawBuilder)
        expect(patch.creditLineCount._sql.toLowerCase()).to.equal('credit_line_count + ?')
        expect(patch.creditLineCount._args[0]).to.equal(1)

        expect(patch.creditLineValue).to.be.an.instanceOf(RawBuilder)
        expect(patch.creditLineValue._sql.toLowerCase()).to.equal('credit_line_value + ?')
        expect(patch.creditLineValue._args[0]).to.equal(transaction.chargeValue)
      })
    })

    describe("and 'subject to minimum charge'", () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      describe("the 'insertData' property of the returned 'tallyObject'", () => {
        it("only includes 'credit' and 'subjectToMinimumCharge' properties", () => {
          const insertData = CreateTransactionTallyService.go(transaction, tableName).insertData

          expect(insertData).to.only.include([
            'creditLineCount',
            'creditLineValue',
            'subjectToMinimumChargeCount',
            'subjectToMinimumChargeCreditValue'
          ])
        })
      })

      describe("the 'updateStatements' property of the returned 'tallyObject'", () => {
        it("only includes 'credit' and 'subjectToMinimumCharge' statements", () => {
          const updateStatements = CreateTransactionTallyService.go(transaction, tableName).updateStatements

          expect(updateStatements).to.be.length(4)
          expect(updateStatements[0]).to.startWith('credit_line_count')
          expect(updateStatements[1]).to.startWith('credit_line_value')
          expect(updateStatements[2]).to.startWith('subject_to_minimum_charge_count')
          expect(updateStatements[3]).to.startWith('subject_to_minimum_charge_credit_value')
        })
      })

      describe("the 'patch' property of the returned 'tallyObject'", () => {
        it("has correctly configured instances of 'Objection RawBuilder'", () => {
          const patch = CreateTransactionTallyService.go(transaction, tableName).patch

          expect(patch.creditLineCount).to.be.an.instanceOf(RawBuilder)
          expect(patch.creditLineCount._sql.toLowerCase()).to.equal('credit_line_count + ?')
          expect(patch.creditLineCount._args[0]).to.equal(1)

          expect(patch.creditLineValue).to.be.an.instanceOf(RawBuilder)
          expect(patch.creditLineValue._sql.toLowerCase()).to.equal('credit_line_value + ?')
          expect(patch.creditLineValue._args[0]).to.equal(transaction.chargeValue)

          expect(patch.subjectToMinimumChargeCount).to.be.an.instanceOf(RawBuilder)
          expect(patch.subjectToMinimumChargeCount._sql.toLowerCase()).to.equal('subject_to_minimum_charge_count + ?')
          expect(patch.subjectToMinimumChargeCount._args[0]).to.equal(1)

          expect(patch.subjectToMinimumChargeCreditValue).to.be.an.instanceOf(RawBuilder)
          expect(patch.subjectToMinimumChargeCreditValue._sql.toLowerCase())
            .to.equal('subject_to_minimum_charge_credit_value + ?')
          expect(patch.subjectToMinimumChargeCreditValue._args[0]).to.equal(transaction.chargeValue)
        })
      })
    })
  })

  describe("When the transaction is 'zero value'", () => {
    beforeEach(() => {
      transaction.chargeValue = 0
    })

    describe("the 'insertData' property of the returned 'tallyObject'", () => {
      it("only includes 'zero value' properties", () => {
        const insertData = CreateTransactionTallyService.go(transaction, tableName).insertData

        expect(insertData).to.only.include(['zeroLineCount'])
      })
    })

    describe("the 'updateStatements' property of the returned 'tallyObject'", () => {
      it("only includes 'zero value' statements", () => {
        const updateStatements = CreateTransactionTallyService.go(transaction, tableName).updateStatements

        expect(updateStatements).to.be.length(1)
        expect(updateStatements[0]).to.startWith('zero_line_count')
      })
    })

    describe("the 'patch' property of the returned 'tallyObject'", () => {
      it("has correctly configured instances of 'Objection RawBuilder'", () => {
        const patch = CreateTransactionTallyService.go(transaction, tableName).patch

        expect(patch.zeroLineCount).to.be.an.instanceOf(RawBuilder)
        expect(patch.zeroLineCount._sql.toLowerCase()).to.equal('zero_line_count + ?')
        expect(patch.zeroLineCount._args[0]).to.equal(1)
      })
    })

    describe("and 'subject to minimum charge'", () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      describe("the 'insertData' property of the returned 'tallyObject'", () => {
        it("only includes 'zero value' and 'subjectToMinimumChargeCount' properties", () => {
          const insertData = CreateTransactionTallyService.go(transaction, tableName).insertData

          expect(insertData).to.only.include(['zeroLineCount', 'subjectToMinimumChargeCount'])
        })
      })

      describe("the 'updateStatements' property of the returned 'tallyObject'", () => {
        it("only includes 'zero value' and 'subjectToMinimumCharge' statements", () => {
          const updateStatements = CreateTransactionTallyService.go(transaction, tableName).updateStatements

          expect(updateStatements).to.be.length(2)
          expect(updateStatements[0]).to.startWith('zero_line_count')
          expect(updateStatements[1]).to.startWith('subject_to_minimum_charge_count')
        })
      })

      describe("the 'patch' property of the returned 'tallyObject'", () => {
        it("has correctly configured instances of 'Objection RawBuilder'", () => {
          const patch = CreateTransactionTallyService.go(transaction, tableName).patch

          expect(patch.zeroLineCount).to.be.an.instanceOf(RawBuilder)
          expect(patch.zeroLineCount._sql.toLowerCase()).to.equal('zero_line_count + ?')
          expect(patch.zeroLineCount._args[0]).to.equal(1)

          expect(patch.subjectToMinimumChargeCount).to.be.an.instanceOf(RawBuilder)
          expect(patch.subjectToMinimumChargeCount._sql.toLowerCase()).to.equal('subject_to_minimum_charge_count + ?')
          expect(patch.subjectToMinimumChargeCount._args[0]).to.equal(1)
        })
      })
    })
  })
})
