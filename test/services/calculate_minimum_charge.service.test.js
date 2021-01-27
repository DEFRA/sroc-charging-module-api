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
const { TransactionModel } = require('../../app/models')

const { CreateTransactionService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

const MINIMUM_CHARGE_LIMIT = 2500

// Thing under test
const { CalculateMinimumChargeService } = require('../../app/services')

describe('Calculate Minimum Charge service', () => {
  let authorisedSystem
  let regime
  let payload

  beforeEach(async () => {
    // Intercept all requests in this test suite as we don't actually want to call the service. Tell Nock to persist()
    // the interception rather than remove it after the first request
    Nock(RulesServiceHelper.url)
      .post(() => true)
      .reply(200, rulesServiceResponse)
      .persist()

    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)
  })

  afterEach(async () => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('When a minimum charge adjustment is required', () => {
    let billRun

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
      payload.subjectToMinimumCharge = true
    })

    it('returns an array of transactions', async () => {
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      expect(calculatedMinimumCharges).to.be.be.an.instanceof(Array)
      expect(calculatedMinimumCharges[0]).to.be.an.instanceOf(TransactionModel)
    })

    it('correctly calculates the debit value', async () => {
      const transaction = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      const transactionRecord = await TransactionModel.query().findById(transaction.transaction.id)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      const minimumChargeTransaction = calculatedMinimumCharges[0]
      expect(minimumChargeTransaction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - transactionRecord.chargeValue)
      expect(minimumChargeTransaction.chargeCredit).to.equal(false)
    })

    it('correctly calculates the credit value', async () => {
      const transaction = await CreateTransactionService.go({ ...payload, credit: true }, billRun.id, authorisedSystem, regime)
      const transactionRecord = await TransactionModel.query().findById(transaction.transaction.id)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      const minimumChargeTransaction = calculatedMinimumCharges[0]
      expect(minimumChargeTransaction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - transactionRecord.chargeValue)
      expect(minimumChargeTransaction.chargeCredit).to.equal(true)
    })

    it('correctly calculates both a credit and debit if required', async () => {
      const creditTransaction = await CreateTransactionService.go({ ...payload, credit: true }, billRun.id, authorisedSystem, regime)
      const debitTransaction = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      const creditTransactionRecord = await TransactionModel.query().findById(creditTransaction.transaction.id)
      const debitTransactionRecord = await TransactionModel.query().findById(debitTransaction.transaction.id)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      const creditMinimumChargeTransction = calculatedMinimumCharges[0]
      const debitMinimumChargeTransction = calculatedMinimumCharges[1]
      expect(creditMinimumChargeTransction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - creditTransactionRecord.chargeValue)
      expect(creditMinimumChargeTransction.chargeCredit).to.equal(true)
      expect(debitMinimumChargeTransction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - debitTransactionRecord.chargeValue)
      expect(debitMinimumChargeTransction.chargeCredit).to.equal(false)
    })
  })

  describe('When no minimum charge adjustment is required', () => {
    let billRun

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
      payload.subjectToMinimumCharge = true

      // We change the rules service mocking so that a large transaction value is returned.
      Nock.cleanAll()
      Nock(RulesServiceHelper.url)
        .post(() => true)
        .reply(200, {
          ...rulesServiceResponse,
          WRLSChargingResponse: {
            ...rulesServiceResponse.WRLSChargingResponse,
            chargeValue: 5000
          }
        })
        .persist()
    })

    it('returns an empty array', async () => {
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      expect(calculatedMinimumCharges).to.be.be.an.instanceof(Array)
      expect(calculatedMinimumCharges).to.be.empty()
    })
  })

  describe('When a bill run has multiple invoices', () => {
    let billRun

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
      payload.subjectToMinimumCharge = true
    })

    it('handles them all correctly', async () => {
      const firstTransaction = await CreateTransactionService.go({ ...payload, customerReference: 'FIRST_CUST' }, billRun.id, authorisedSystem, regime)
      const secondTransaction = await CreateTransactionService.go({ ...payload, customerReference: 'SECOND_CUST' }, billRun.id, authorisedSystem, regime)
      const firstRecord = await TransactionModel.query().findById(firstTransaction.transaction.id)
      const secondRecord = await TransactionModel.query().findById(secondTransaction.transaction.id)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      expect(calculatedMinimumCharges[0].chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - firstRecord.chargeValue)
      expect(calculatedMinimumCharges[1].chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - secondRecord.chargeValue)
    })
  })
})
