'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper } = require('../support/helpers')
const { BillRunModel } = require('../../app/models')

// Thing under test
const { BillRunService } = require('../../app/services')

describe('Bill Run service', () => {
  const authorisedSystemId = '6fd613d8-effb-4bcd-86c7-b0025d121692'
  const regimeId = '4206994c-5db9-4539-84a6-d4b6a671e2ba'
  const dummyTransaction = {
    customerReference: 'CUSTOMER_REFERENCE',
    chargeFinancialYear: 2021,
    chargeCredit: false,
    chargeValue: 5678
  }
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId)
    })

    it('returns the matching bill run', async () => {
      const transaction = { ...dummyTransaction, billRunId: billRun.id }

      const result = await BillRunService.go(transaction)

      expect(result.id).to.equal(billRun.id)
    })

    describe('When a debit transaction is supplied', () => {
      it('correctly calculates the summary', async () => {
        const transaction = { ...dummyTransaction, billRunId: billRun.id }

        const result = await BillRunService.go(transaction)

        expect(result.debitCount).to.equal(1)
        expect(result.debitValue).to.equal(transaction.chargeValue)
      })
    })

    describe('When a credit transaction is supplied', () => {
      it('correctly calculates the summary', async () => {
        const transaction = { ...dummyTransaction, billRunId: billRun.id, chargeCredit: true }

        const result = await BillRunService.go(transaction)

        expect(result.creditCount).to.equal(1)
        expect(result.creditValue).to.equal(transaction.chargeValue)
      })
    })

    describe('When a zero value transaction is supplied', () => {
      it('correctly calculates the summary', async () => {
        const transaction = { ...dummyTransaction, billRunId: billRun.id, chargeValue: 0 }

        const result = await BillRunService.go(transaction)

        expect(result.zeroCount).to.equal(1)
      })
    })

    describe('When a new licence transaction is supplied', () => {
      it('correctly sets the new licence flag', async () => {
        const transaction = { ...dummyTransaction, billRunId: billRun.id, newLicence: true }

        const result = await BillRunService.go(transaction)

        expect(result.newLicenceCount).to.equal(1)
      })
    })

    describe('When two transactions are created', () => {
      it('correctly calculates the summary', async () => {
        const transaction = { ...dummyTransaction, billRunId: billRun.id }
        const firstResult = await BillRunService.go(transaction)
        // We save the invoice with stats to the database as this isn't done by BillRunService
        await BillRunModel.query().update(firstResult)

        const secondResult = await BillRunService.go(transaction)

        expect(secondResult.debitCount).to.equal(2)
        expect(secondResult.debitValue).to.equal(transaction.chargeValue * 2)
      })
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    const unknownBillRunId = '05f32bd9-7bce-42c2-8d6a-b14a8e26d531'

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
  })
})
