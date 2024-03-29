'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper.js')
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const RegimeHelper = require('../../support/helpers/regime.helper.js')
const RulesServiceHelper = require('../../support/helpers/rules_service.helper.js')

const LicenceModel = require('../../../app/models/licence.model.js')
const TransactionModel = require('../../../app/models/transaction.model.js')

const CreateTransactionService = require('../../../app/services/transactions/create_transaction.service.js')

const { presroc: requestFixtures } = require('../../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../../support/fixtures/calculate_charge')

// Thing under test
const CreateMinimumChargeAdjustmentTransactionService = require('../../../app/services/transactions/create_minimum_charge_adjustment_transaction.service.js')

describe('Create Minimum Charge Adjustment Transaction service', () => {
  let authorisedSystem
  let regime
  let payload

  const chargeValue = 789
  const chargeCredit = true

  before(async () => {
    // Intercept all requests in this test suite as we don't actually want to call the service. Tell Nock to persist()
    // the interception rather than remove it after the first request
    Nock(RulesServiceHelper.url)
      .post(() => true)
      .reply(200, chargeFixtures.simple.rulesService)
      .persist()
  })

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

  after(async () => {
    Nock.cleanAll()
  })

  describe('When the data is valid', () => {
    let billRun
    let transaction
    let transactionRecord
    let licence
    let minimumChargeAdjustment

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
      transaction = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
      transactionRecord = await TransactionModel.query().findById(transaction.transaction.id)
      licence = await LicenceModel.query().findById(transactionRecord.licenceId)
      minimumChargeAdjustment = await CreateMinimumChargeAdjustmentTransactionService.go(licence, chargeValue, chargeCredit)
    })

    it('returns a transaction', async () => {
      expect(minimumChargeAdjustment).to.be.be.an.instanceof(TransactionModel)
    })

    it('has the correct charge value', async () => {
      expect(minimumChargeAdjustment.chargeValue).to.equal(chargeValue)
    })

    it('has the correct charge credit', async () => {
      expect(minimumChargeAdjustment.chargeCredit).to.equal(chargeCredit)
    })

    it('has subjectToMinimumCharge set to true', async () => {
      expect(minimumChargeAdjustment.subjectToMinimumCharge).to.equal(true)
    })

    it('has minimumChargeAdjustment set to true', async () => {
      expect(minimumChargeAdjustment.minimumChargeAdjustment).to.equal(true)
    })

    it('has the correct lineDescription', async () => {
      expect(minimumChargeAdjustment.lineDescription).to.equal(
        'Minimum Charge Calculation - raised under Schedule 23 of the Environment Act 1995'
      )
    })

    it('reads data from another transaction within the licence', async () => {
      const fieldsToTest = [
        'billRunId',
        'regimeId',
        'createdBy',
        'region',
        'customerReference',
        'lineAreaCode',
        'lineAttr1',
        'lineAttr2',
        'ruleset',
        'chargeFinancialYear'
      ]

      fieldsToTest.forEach(field => expect(minimumChargeAdjustment[field]).to.equal(transactionRecord[field]))
    })
  })
})
