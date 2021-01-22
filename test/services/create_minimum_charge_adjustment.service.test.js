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
const { LicenceModel, TransactionModel } = require('../../app/models')
const { ValidationError } = require('joi')

const { CreateTransactionService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')

// Thing under test
const { CreateMinimumChargeAdjustmentService } = require('../../app/services')

describe('Create Minimum Charge Adjustment service', () => {
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
    let transactionRecord
    let licence
    let minimumChargeAdjustment
    let result

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
      transaction = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      transactionRecord = await TransactionModel.query().findById(transaction.transaction.id)
      licence = await LicenceModel.query().findById(transactionRecord.licenceId)
      minimumChargeAdjustment = await CreateMinimumChargeAdjustmentService.go(licence, billRun.id, authorisedSystem, regime)
    })

    it('creates a transaction', async () => {
      result = await TransactionModel.query().findById(minimumChargeAdjustment.transaction.id)
      expect(result.id).to.exist()
    })
  })
})
