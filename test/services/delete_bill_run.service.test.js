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

const {
  BillRunModel,
  InvoiceModel,
  LicenceModel,
  TransactionModel
} = require('../../app/models')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

const { CreateTransactionService } = require('../../app/services')

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { DeleteBillRunService } = require('../../app/services')

describe('Delete Bill Run service', () => {
  let billRun
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

    Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

    await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid bill run is supplied', () => {
    it('deletes the bill run', async () => {
      await DeleteBillRunService.go(billRun)

      const result = await BillRunModel.query().findById(billRun.id)
      expect(result).to.not.exist()
    })

    it('deletes the bill run invoices', async () => {
      await DeleteBillRunService.go(billRun)

      const invoices = await InvoiceModel.query().select().where({ billRunId: billRun.id })
      expect(invoices).to.be.empty()
    })

    it('deletes the bill run licences', async () => {
      await DeleteBillRunService.go(billRun)

      const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
      expect(licences).to.be.empty()
    })

    it('deletes the bill run transactions', async () => {
      await DeleteBillRunService.go(billRun)

      const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
      expect(transactions).to.be.empty()
    })
  })

  describe('When an invalid bill run is supplied', () => {
    describe("because the status is 'billed'", () => {
      it('throws an error', async () => {
        billRun.status = 'billed'
        const err = await expect(DeleteBillRunService.go(billRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${billRun.id} has a status of 'billed'.`)
      })
    })
  })
})
