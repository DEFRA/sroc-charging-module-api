// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Things we need to stub
import RulesService from '../../app/services/rules.service.js'

// Additional dependencies needed
import TransactionModel from '../../app/models/transaction.model.js'
import { ValidationError } from 'joi'

// Thing under test
import CreateTransactionService from '../../app/services/create_transaction.service.js'

// Fixtures
import * as fixtures from '../support/fixtures/fixtures.js'
const chargeFixtures = fixtures.calculateCharge
const requestFixtures = fixtures.createTransaction

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Create Transaction service', () => {
  let billRun
  let authorisedSystem
  let regime
  let payload

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When the data is valid', () => {
    describe('and the bill run has not been generated', () => {
      let result

      beforeEach(async () => {
        Sinon.stub(RulesService, 'go').returns(chargeFixtures.simple.rulesService)
        const transaction = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        result = await TransactionModel.query().findById(transaction.transaction.id)
      })

      it('creates a transaction', async () => {
        expect(result.id).to.exist()
      })
    })

    describe('and the bill run has been generated', () => {
      let result

      beforeEach(async () => {
        Sinon.stub(RulesService, 'go').returns(chargeFixtures.simple.rulesService)
        const transaction = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        result = await TransactionModel.query().findById(transaction.transaction.id)
      })

      it('creates a transaction', async () => {
        expect(result.id).to.exist()
      })

      it("resets the bill run to 'initialised'", async () => {
        await BillRunHelper.generateBillRun(billRun.id)
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun.status).to.equal('initialised')
        expect(refreshedBillRun.invoiceCount).to.equal(0)
      })
    })
  })

  describe('When the data is invalid', () => {
    describe("because the 'payload' is invalid", () => {
      describe("due to an item validated by the 'transaction'", () => {
        it('throws an error', async () => {
          payload.customerReference = ''

          const err = await expect(
            CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          ).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })

      describe("due to an item validated by the 'charge'", () => {
        it('throws an error', async () => {
          payload.periodStart = '01-APR-2021'

          const err = await expect(
            CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          ).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })
    })

    describe("because the request is for a duplicate transaction (matching clientId's)", () => {
      beforeEach(async () => {
        Sinon.stub(RulesService, 'go').returns(chargeFixtures.simple.rulesService)
      })

      it('throws an error', async () => {
        payload.clientId = 'DOUBLEIMPACT'

        // Add the first transaction
        await TransactionHelper.addTransaction(billRun.id, { regimeId: regime.id, clientId: 'DOUBLEIMPACT' })

        // Attempt to add a transaction with a duplicate clientId
        const err = await expect(
          CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        ).to.reject()

        expect(err).to.be.an.error()
      })
    })
  })
})
