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

  describe('When a valid bill run is supplied', () => {
    describe("the 'patch' object returned", () => {
      it('contains the matching bill run ID', async () => {
        const result = await CreateTransactionBillRunService.go(billRun, transaction)

        expect(result.id).to.equal(billRun.id)
      })
    })

    describe('and a debit transaction', () => {
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

    describe('and a credit transaction', () => {
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

    describe('and a zero value transaction', () => {
      beforeEach(() => {
        transaction.chargeValue = 0
      })

      it('correctly generates the patch', async () => {
        const result = await CreateTransactionBillRunService.go(billRun, transaction)

        expect(result.update).to.only.include(['zeroLineCount'])
      })
    })
  })

  describe('When an invalid bill run is supplied', () => {
    describe('because the bill run is for a different region', () => {
      beforeEach(() => {
        billRun.region = 'W'
      })

      it('throws an error', async () => {
        const err = await expect(CreateTransactionBillRunService.go(billRun, transaction)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message)
          .to
          .equal(`Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${transaction.region}.`)
      })
    })
  })
})
