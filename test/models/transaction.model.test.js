'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  TransactionHelper
} = require('../support/helpers')

// Thing under test
const { TransactionModel } = require('../../app/models')

describe.only('Transaction Model', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  describe('Query modifiers', () => {
    describe('#hasChargeValue', () => {
      describe('when there is a transaction with a charge', () => {
        let hasValueTransaction

        beforeEach(async () => {
          hasValueTransaction = await TransactionHelper.addTransaction(billRun.id, { chargeValue: 12345 })
        })

        it('returns the transaction', async () => {
          const results = await TransactionModel.query().modify('hasChargeValue')

          expect(results.length).to.equal(1)
          expect(results[0].id).to.equal(hasValueTransaction.id)
        })
      })

      describe('when there is a transaction with zero charge', () => {
        beforeEach(async () => {
          await TransactionHelper.addTransaction(billRun.id, { chargeValue: 0 })
        })

        it('returns no transaction', async () => {
          const results = await TransactionModel.query().modify('hasChargeValue')

          expect(results.length).to.equal(0)
        })
      })
    })
  })
})
