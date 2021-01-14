'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  RegimeHelper
} = require('../support/helpers')
const { TransactionModel } = require('../../app/models')

describe('Handling BigInts', () => {
  let authorisedSystem
  let regime
  let billRun

  const dummyTransaction = (regimeId, createdBy, billRunId) => {
    return {
      chargeValue: 2547483647,
      ruleset: 'presroc',
      invoiceId: 'f0d3b4dc-2cae-11eb-adc1-0242ac120002',
      licenceId: 'f0d3b4dc-2cae-11eb-adc1-0242ac120002',
      regimeId,
      createdBy,
      billRunId
    }
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  describe('Transactions', () => {
    let transaction

    beforeEach(async () => {
      transaction = await TransactionModel.query()
        .insert(dummyTransaction(regime.id, authorisedSystem.id, billRun.id))
    })

    describe('When a transaction is added', () => {
      it('handles a charge value greater than 2147483647', async () => {
        expect(transaction.id).to.exist()
      })
    })

    describe('When a transaction is selected', () => {
      it('the charge value is returned as an integer', async () => {
        const selectedTransaction = await TransactionModel.query().findById(transaction.id)

        expect(selectedTransaction.id).to.equal(transaction.id)
        expect(selectedTransaction.chargeValue).to.be.a.number()
        expect(selectedTransaction.chargeValue).to.equal(2547483647)
      })
    })
  })
})
