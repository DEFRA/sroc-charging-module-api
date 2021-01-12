'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper
} = require('../support/helpers')
const { TransactionModel } = require('../../app/models')
const { ValidationError } = require('joi')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { CreateTransactionService } = require('../../app/services')

describe('Create Transaction service', () => {
  const billRunId = 'b976d8e4-3644-11eb-adc1-0242ac120002'
  let authorisedSystem
  let regime
  let payload

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When the data is valid', () => {
    let billRun
    let transaction
    let result

    beforeEach(async () => {
      Sinon.stub(RulesService, 'go').returns(chargeFixtures.simple.rulesService)
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
      transaction = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      result = await TransactionModel.query().findById(transaction.transaction.id)
    })

    it('creates a transaction', async () => {
      expect(result.id).to.exist()
    })
  })

  describe('When the data is invalid', () => {
    describe("because the 'payload' is invalid", () => {
      describe("due to an item validated by the 'transaction'", () => {
        it('throws an error', async () => {
          payload.customerReference = ''

          const err = await expect(
            CreateTransactionService.go(payload, billRunId, authorisedSystem, regime)
          ).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })

      describe("due to an item validated by the 'charge'", () => {
        let billRun

        beforeEach(async () => {
          billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
        })

        it('throws an error', async () => {
          payload.periodStart = '01-APR-2021'

          const err = await expect(
            CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
          ).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })
    })

    describe("because 'authorisedSystem' is not specified", () => {
      it('throws an error', async () => {
        const err = await expect(CreateTransactionService.go(payload, billRunId, null, regime)).to.reject(TypeError)

        expect(err).to.be.an.error()
      })
    })

    describe("because 'regime' is not specified", () => {
      it('throws an error', async () => {
        const err = await expect(CreateTransactionService.go(payload, billRunId, authorisedSystem)).to.reject(TypeError)

        expect(err).to.be.an.error()
      })
    })

    describe("because the 'bill run' does not exist", () => {
      it('throws an error', async () => {
        const err = await expect(CreateTransactionService.go(payload, billRunId, authorisedSystem, regime)).to.reject()

        expect(err).to.be.an.error()
      })
    })

    describe("because the 'bill run' is not 'editable'", () => {
      let billRun

      beforeEach(async () => {
        billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'billed')
      })

      it('throws an error', async () => {
        const err = await expect(
          CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
        ).to.reject()

        expect(err).to.be.an.error()
      })
    })
  })
})
