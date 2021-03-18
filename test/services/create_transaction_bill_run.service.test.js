'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, GeneralHelper } = require('../support/helpers')

// Thing under test
const { CreateTransactionBillRunService } = require('../../app/services')

describe('Create Transaction Bill Run service', () => {
  let billRun
  let transaction

  beforeEach(async () => {
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())

    transaction = {
      region: 'A',
      chargeCredit: false,
      chargeValue: 5678
    }
  })

  describe("the 'patch' object returned", () => {
    it('contains the matching bill run ID', async () => {
      const result = await CreateTransactionBillRunService.go(billRun, transaction)

      expect(result.id).to.equal(billRun.id)
    })
  })

  describe('When a valid debit transaction is supplied', () => {
    it("correctly generates and returns a 'patch' object", async () => {
      const result = await CreateTransactionBillRunService.go(billRun, transaction)

      expect(result.update).to.only.include(['debitLineCount', 'debitLineValue'])
    })

    describe('subject to minimum charge', () => {
      beforeEach(async () => {
        transaction.subjectToMinimumCharge = true
      })

      it("correctly generates and returns a 'patch' object", async () => {
        const result = await CreateTransactionBillRunService.go(billRun, transaction)

        expect(result.update).to.only.include([
          'debitLineCount',
          'debitLineValue',
          'subjectToMinimumChargeCount',
          'subjectToMinimumChargeDebitValue'
        ])
      })
    })
  })

  describe('When a valid credit transaction is supplied', () => {
    beforeEach(() => {
      transaction.chargeCredit = true
    })

    it('correctly generates the patch', async () => {
      const result = await CreateTransactionBillRunService.go(billRun, transaction)

      expect(result.update).to.only.include(['creditLineCount', 'creditLineValue'])
    })

    describe('subject to minimum charge', () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      it("correctly generates and returns a 'patch' object", async () => {
        const result = await CreateTransactionBillRunService.go(billRun, transaction)

        expect(result.update).to.only.include([
          'creditLineCount',
          'creditLineValue',
          'subjectToMinimumChargeCount',
          'subjectToMinimumChargeCreditValue'
        ])
      })
    })
  })

  describe('When a valid zero value transaction is supplied', () => {
    beforeEach(() => {
      transaction.chargeValue = 0
    })

    it('correctly generates the patch', async () => {
      const result = await CreateTransactionBillRunService.go(billRun, transaction)

      expect(result.update).to.only.include(['zeroLineCount'])
    })

    describe('subject to minimum charge', () => {
      beforeEach(() => {
        transaction.subjectToMinimumCharge = true
      })

      it("correctly generates and returns a 'patch' object", async () => {
        const result = await CreateTransactionBillRunService.go(billRun, transaction)

        expect(result.update).to.only.include([
          'zeroLineCount',
          'subjectToMinimumChargeCount'
        ])
      })
    })
  })
})
