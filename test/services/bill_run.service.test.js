'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, GeneralHelper } = require('../support/helpers')
const { BillRunModel } = require('../../app/models')

// Thing under test
const { BillRunService } = require('../../app/services')

describe('Bill Run service', () => {
  const authorisedSystemId = GeneralHelper.uuid4()
  const regimeId = GeneralHelper.uuid4()
  const dummyTransaction = {
    customerReference: 'CUSTOMER_REFERENCE',
    region: 'A',
    chargeFinancialYear: 2021,
    chargeCredit: false,
    chargeValue: 5678
  }
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid bill run ID is supplied', () => {
    let transaction

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId)
      transaction = { ...dummyTransaction, billRunId: billRun.id }
    })

    it('returns the matching bill run', async () => {
      const result = await BillRunService.go(transaction)

      expect(result.id).to.equal(billRun.id)
    })

    describe('When a debit transaction is supplied', () => {
      it('correctly calculates the summary', async () => {
        const result = await BillRunService.go(transaction)

        expect(result.debitLineCount).to.equal(1)
        expect(result.debitLineValue).to.equal(transaction.chargeValue)
      })
    })

    describe('When a credit transaction is supplied', () => {
      it('correctly calculates the summary', async () => {
        transaction.chargeCredit = true

        const result = await BillRunService.go(transaction)

        expect(result.creditLineCount).to.equal(1)
        expect(result.creditLineValue).to.equal(transaction.chargeValue)
      })
    })

    describe('When a zero value transaction is supplied', () => {
      it('correctly calculates the summary', async () => {
        transaction.chargeValue = 0

        const result = await BillRunService.go(transaction)

        expect(result.zeroLineCount).to.equal(1)
      })
    })

    describe('When a transaction subject to minimum charge is supplied', () => {
      beforeEach(async () => {
        transaction.subjectToMinimumCharge = true
      })

      it('correctly sets the subject to minimum charge flag', async () => {
        const result = await BillRunService.go(transaction)

        expect(result.subjectToMinimumChargeCount).to.equal(1)
      })

      describe('and the total is needed', () => {
        beforeEach(async () => {
          transaction.billRunId = billRun.id
        })

        it('correctly calculates the total for a debit', async () => {
          const firstResult = await BillRunService.go(transaction)
          // We save the invoice with stats to the database as this isn't done by BillRunService
          await BillRunModel.query().update(firstResult)

          const secondResult = await BillRunService.go(transaction)

          expect(secondResult.subjectToMinimumChargeCount).to.equal(2)
          expect(secondResult.subjectToMinimumChargeDebitValue).to.equal(transaction.chargeValue * 2)
        })

        it('correctly calculates the total for a credit', async () => {
          transaction.chargeCredit = true

          const firstResult = await BillRunService.go(transaction)
          // We save the invoice with stats to the database as this isn't done by BillRunService
          await BillRunModel.query().update(firstResult)

          const secondResult = await BillRunService.go(transaction)

          expect(secondResult.subjectToMinimumChargeCount).to.equal(2)
          expect(secondResult.subjectToMinimumChargeCreditValue).to.equal(transaction.chargeValue * 2)
        })
      })
    })

    describe('When two transactions are created', () => {
      it('correctly calculates the summary', async () => {
        transaction.billRunId = billRun.id
        const firstResult = await BillRunService.go(transaction)
        // We save the invoice with stats to the database as this isn't done by BillRunService
        await BillRunModel.query().update(firstResult)

        const secondResult = await BillRunService.go(transaction)

        expect(secondResult.debitLineCount).to.equal(2)
        expect(secondResult.debitLineValue).to.equal(transaction.chargeValue * 2)
      })
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    const unknownBillRunId = GeneralHelper.uuid4()

    describe('because no matching bill run exists', () => {
      it('throws an error', async () => {
        const transaction = { ...dummyTransaction, billRunId: unknownBillRunId }

        const err = await expect(BillRunService.go(transaction)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
      })
    })

    describe('because the bill run is not editable', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId, 'A', 'billed')
      })

      it('throws an error', async () => {
        const transaction = { ...dummyTransaction, billRunId: billRun.id }

        const err = await expect(BillRunService.go(transaction)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message)
          .to
          .equal(`Bill run ${billRun.id} cannot be edited because its status is billed.`)
      })
    })

    describe('because the bill run is for a different region', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId, 'W')
      })

      it('throws an error', async () => {
        const transaction = { ...dummyTransaction, billRunId: billRun.id }

        const err = await expect(BillRunService.go(transaction)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message)
          .to
          .equal(`Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${transaction.region}.`)
      })
    })
  })
})
