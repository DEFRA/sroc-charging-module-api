// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Nock from 'nock'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import RulesServiceHelper from '../support/helpers/rules_service.helper.js'

// Additional dependencies needed
import CreateTransactionService from '../../app/services/create_transaction.service.js'
import LicenceModel from '../../app/models/licence.model.js'
import TransactionModel from '../../app/models/transaction.model.js'

// Thing under test
import CreateMinimumChargeAdjustmentService from '../../app/services/create_minimum_charge_adjustment.service.js'

// Fixtures
import * as fixtures from '../support/fixtures/fixtures.js'
const chargeFixtures = fixtures.calculateCharge
const requestFixtures = fixtures.createTransaction

// Test framework setup
const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

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
