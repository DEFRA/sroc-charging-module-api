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
  RegimeHelper,
  RulesServiceHelper
} = require('../support/helpers')
const { TransactionModel } = require('../../app/models')

const { CreateTransactionService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesService } = require('../../app/services')

const MINIMUM_CHARGE_LIMIT = 2500

// Thing under test
const { CalculateMinimumChargeService } = require('../../app/services')

describe('Calculate Minimum Charge service', () => {
  let authorisedSystem
  let regime
  let payload
  let rulesServiceStub
  let billRun

  beforeEach(async () => {
    rulesServiceStub = RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 500)

    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // Clone the request fixture and add subjectToMinimumCharge: true to reduce setup in tests
    payload = {
      ...GeneralHelper.cloneObject(requestFixtures.simple),
      subjectToMinimumCharge: true
    }

    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a minimum charge adjustment is required', () => {
    it('returns an array of transactions', async () => {
      await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      expect(calculatedMinimumCharges).to.be.be.an.instanceof(Array)
      expect(calculatedMinimumCharges[0]).to.be.an.instanceOf(TransactionModel)
    })

    it('correctly calculates the debit value', async () => {
      const transaction = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
      const transactionRecord = await TransactionModel.query().findById(transaction.transaction.id)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      const minimumChargeTransaction = calculatedMinimumCharges[0]
      expect(minimumChargeTransaction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - transactionRecord.chargeValue)
      expect(minimumChargeTransaction.chargeCredit).to.equal(false)
    })

    it('correctly calculates the credit value', async () => {
      const transaction = await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)
      const transactionRecord = await TransactionModel.query().findById(transaction.transaction.id)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      const minimumChargeTransaction = calculatedMinimumCharges[0]
      expect(minimumChargeTransaction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - transactionRecord.chargeValue)
      expect(minimumChargeTransaction.chargeCredit).to.equal(true)
    })

    it('correctly calculates both a credit and debit if required', async () => {
      const creditTransaction = await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)
      const debitTransaction = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
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
    describe('because the value is over the minimum charge limit', () => {
      it('returns an empty array', async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5000)
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

        const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

        expect(calculatedMinimumCharges).to.be.be.an.instanceof(Array)
        expect(calculatedMinimumCharges).to.be.empty()
      })
    })

    describe("because minimum charge doesn't apply to this transaction", () => {
      it('returns an empty array', async () => {
        await CreateTransactionService.go({ ...payload, subjectToMinimumCharge: false }, billRun, authorisedSystem, regime)

        const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

        expect(calculatedMinimumCharges).to.be.be.an.instanceof(Array)
        expect(calculatedMinimumCharges).to.be.empty()
      })
    })
  })

  describe('When a bill run has multiple invoices', () => {
    it('handles them all correctly', async () => {
      const firstTransaction = await CreateTransactionService.go({ ...payload, customerReference: 'FIRST_CUST' }, billRun, authorisedSystem, regime)
      const secondTransaction = await CreateTransactionService.go({ ...payload, customerReference: 'SECOND_CUST' }, billRun, authorisedSystem, regime)
      const firstRecord = await TransactionModel.query().findById(firstTransaction.transaction.id)
      const secondRecord = await TransactionModel.query().findById(secondTransaction.transaction.id)

      const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

      expect(calculatedMinimumCharges[0].chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - firstRecord.chargeValue)
      expect(calculatedMinimumCharges[1].chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - secondRecord.chargeValue)
    })
  })

  describe('When an invoice has a licence over the minimum charge limit', () => {
    let minimumTransaction

    beforeEach(async () => {
      minimumTransaction = await CreateTransactionService.go({
        ...payload,
        subjectToMinimumCharge: true,
        licenceNumber: 'UNDER_MINUMUM'
      }, billRun, authorisedSystem, regime)
    })

    describe('and the licence over the limit is subject to minimum charge', () => {
      beforeEach(async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5000)

        await CreateTransactionService.go({
          ...payload,
          licenceNumber: 'OVER_MINUMUM'
        }, billRun, authorisedSystem, regime)
      })

      it('correctly creates one minimum charge', async () => {
        const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

        expect(calculatedMinimumCharges).to.be.be.an.instanceof(Array)
        expect(calculatedMinimumCharges).to.have.length(1)
        expect(calculatedMinimumCharges[0]).to.be.an.instanceOf(TransactionModel)
      })

      it('correctly calculates the minimum charge', async () => {
        const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)
        const transactionRecord = await TransactionModel.query().findById(minimumTransaction.transaction.id)

        const minimumChargeTransaction = calculatedMinimumCharges[0]
        expect(minimumChargeTransaction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - transactionRecord.chargeValue)
        expect(minimumChargeTransaction.chargeCredit).to.equal(false)
      })
    })

    describe('and the licence over the limit is not subject to minimum charge', () => {
      beforeEach(async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5000)

        await CreateTransactionService.go({
          ...payload,
          licenceNumber: 'NOT_MINUMUM',
          subjectToMinimumCharge: false
        }, billRun, authorisedSystem, regime)
      })

      it('correctly creates a minimum charge', async () => {
        const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)

        expect(calculatedMinimumCharges).to.be.be.an.instanceof(Array)
        expect(calculatedMinimumCharges).to.have.length(1)
        expect(calculatedMinimumCharges[0]).to.be.an.instanceOf(TransactionModel)
      })

      it('correctly calculates the minimum charge', async () => {
        const calculatedMinimumCharges = await CalculateMinimumChargeService.go(billRun)
        const transactionRecord = await TransactionModel.query().findById(minimumTransaction.transaction.id)

        const minimumChargeTransaction = calculatedMinimumCharges[0]
        expect(minimumChargeTransaction.chargeValue).to.equal(MINIMUM_CHARGE_LIMIT - transactionRecord.chargeValue)
        expect(minimumChargeTransaction.chargeCredit).to.equal(false)
      })
    })
  })
})
