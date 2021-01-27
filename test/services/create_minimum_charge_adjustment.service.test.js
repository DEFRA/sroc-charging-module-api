'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper,
  RulesServiceHelper
} = require('../support/helpers')
const { LicenceModel, TransactionModel } = require('../../app/models')

const { CreateTransactionService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

// Thing under test
const { CreateMinimumChargeAdjustmentService } = require('../../app/services')

describe('Create Minimum Charge Adjustment service', () => {
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
      transaction = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      transactionRecord = await TransactionModel.query().findById(transaction.transaction.id)
      licence = await LicenceModel.query().findById(transactionRecord.licenceId)
      minimumChargeAdjustment = await CreateMinimumChargeAdjustmentService.go(licence, chargeValue, chargeCredit)
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

    it('reads data from another transaction within the licence', async () => {
      const fieldsToTest = [
        'billRunId',
        'regimeId',
        'createdBy',
        'region',
        'customerReference',
        'lineAttr1',
        'lineAttr2',
        'lineDescription',
        'ruleset',
        'chargeFinancialYear'
      ]

      fieldsToTest.forEach(field => expect(minimumChargeAdjustment[field]).to.equal(transactionRecord[field]))
    })
  })
})
