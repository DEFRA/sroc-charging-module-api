'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper.js')
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const NewBillRunHelper = require('../../support/helpers/new_bill_run.helper.js')
const NewTransactionHelper = require('../../support/helpers/new_transaction.helper.js')
const RegimeHelper = require('../../support/helpers/regime.helper.js')

const BillRunModel = require('../../../app/models/bill_run.model.js')
const TransactionModel = require('../../../app/models/transaction.model.js')
const { ValidationError } = require('joi')

const { presroc: presrocTransactionFixtures } = require('../../support/fixtures/create_transaction')
const { sroc: srocTransactionFixtures } = require('../../support/fixtures/create_transaction')

const { presroc: presrocChargeFixtures } = require('../../support/fixtures/calculate_charge')
const { sroc: srocChargeFixtures } = require('../../support/fixtures/calculate_charge')

// Things we need to stub
const RequestRulesServiceCharge = require('../../../app/services/charges/request_rules_service_charge.service.js')

// Thing under test
const CreateTransactionService = require('../../../app/services/transactions/create_transaction.service.js')

describe('Create Transaction service', () => {
  let billRun
  let authorisedSystem
  let regime
  let presrocPayload
  let srocPayload

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    billRun = await NewBillRunHelper.create(regime.id, authorisedSystem.id)

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    presrocPayload = GeneralHelper.cloneObject(presrocTransactionFixtures.simple)
    srocPayload = GeneralHelper.cloneObject(srocTransactionFixtures.simple)

    // We use Sinon matchers to determine whether RequestRulesServiceCharge was called with a presroc or sroc request
    // and return the appropriate fixture
    Sinon.stub(RequestRulesServiceCharge, 'go')
      .withArgs(Sinon.match.has('ruleset', 'presroc')).returns(presrocChargeFixtures.simple.rulesService)
      .withArgs(Sinon.match.has('ruleset', 'sroc')).returns(srocChargeFixtures.simple.rulesService)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When the data is valid', () => {
    describe('and the bill run has not been generated', () => {
      it('creates a transaction', async () => {
        const transaction = await CreateTransactionService.go(presrocPayload, billRun, authorisedSystem, regime)
        const result = await TransactionModel.query().findById(transaction.transaction.id)

        expect(result.id).to.exist()
      })
    })

    describe('and the bill run has been generated', () => {
      let transaction

      beforeEach(async () => {
        await BillRunHelper.generateBillRun(billRun.id)
        transaction = await CreateTransactionService.go(presrocPayload, billRun, authorisedSystem, regime)
      })

      it('creates a transaction', async () => {
        const result = await TransactionModel.query().findById(transaction.transaction.id)

        expect(result.id).to.exist()
      })

      it("resets the bill run to 'initialised'", async () => {
        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun.status).to.equal('initialised')
        expect(refreshedBillRun.invoiceCount).to.equal(0)
      })
    })

    describe('and the bill run is presroc', () => {
      let presrocBillRun

      beforeEach(async () => {
        presrocBillRun = await NewBillRunHelper.create(null, null, { ruleset: 'presroc' })
      })

      it('creates a transaction', async () => {
        const transaction = await CreateTransactionService.go(presrocPayload, presrocBillRun, authorisedSystem, regime)
        const result = await TransactionModel.query().findById(transaction.transaction.id)

        expect(result.id).to.exist()
      })
    })

    describe('and the bill run is sroc', () => {
      let srocBillRun

      beforeEach(async () => {
        srocBillRun = await NewBillRunHelper.create(null, null, { ruleset: 'sroc' })
      })

      it('creates a transaction', async () => {
        const transaction = await CreateTransactionService.go(srocPayload, srocBillRun, authorisedSystem, regime)
        const result = await TransactionModel.query().findById(transaction.transaction.id)

        expect(result.id).to.exist()
      })
    })
  })

  describe('When the data is invalid', () => {
    describe('because the payload is invalid', () => {
      describe('due to an item validated by the transaction', () => {
        it('throws an error', async () => {
          presrocPayload.customerReference = ''

          const err = await expect(
            CreateTransactionService.go(presrocPayload, billRun, authorisedSystem, regime)
          ).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })

      describe('due to an item validated by the charge', () => {
        it('throws an error', async () => {
          presrocPayload.periodStart = '01-APR-2021'

          const err = await expect(
            CreateTransactionService.go(presrocPayload, billRun, authorisedSystem, regime)
          ).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })

      describe('due to an invalid ruleset', () => {
        it('throws an error', async () => {
          // CreateTransactionService takes the ruleset from the bill run, not the payload
          billRun.ruleset = 'INVALID'

          const err = await expect(
            CreateTransactionService.go(presrocPayload, billRun, authorisedSystem, regime)
          ).to.reject()

          expect(err).to.be.an.error()
        })
      })
    })

    describe("because the request is for a duplicate transaction (matching clientId's)", () => {
      it('throws an error', async () => {
        presrocPayload.clientId = 'DOUBLEIMPACT'

        // Add the first transaction
        const firstTransaction = await NewTransactionHelper.create(null, { regimeId: regime.id, clientId: 'DOUBLEIMPACT' })
        const firstTransactionBillRun = await BillRunModel.query().findById(firstTransaction.billRunId)

        // Attempt to add a transaction with a duplicate clientId
        const err = await expect(
          CreateTransactionService.go(presrocPayload, firstTransactionBillRun, authorisedSystem, regime)
        ).to.reject()

        expect(err).to.be.an.error()
      })
    })
  })
})
