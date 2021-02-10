'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, describe, it, beforeEach } = exports.lab = Lab.script()
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

const { CreateTransactionService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { ViewBillRunService } = require('../../app/services')

describe.only('View bill run service', () => {
  let billRun
  let payload
  let regime
  let authorisedSystem
  let rulesServiceStub

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

  describe('When there is a matching bill run', () => {
    beforeEach(async () => {
      rulesServiceStub = Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    })

    it('returns the correct basic info', async () => {
      const result = await ViewBillRunService.go(billRun.id)

      expect(result.billRun.id).to.equal(billRun.id)
      expect(result.billRun.region).to.equal(billRun.region)
      expect(result.billRun.status).to.equal(billRun.status)
    })

    it('returns correct credit/debit values', async () => {
      const creditValue = 1000
      const debitValue = 5000

      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, creditValue)
      await CreateTransactionService.go({ ...payload, credit: true }, billRun.id, authorisedSystem, regime)

      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, debitValue)
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

      const result = await ViewBillRunService.go(billRun.id)

      expect(result.billRun.creditLineCount).to.equal(1)
      expect(result.billRun.creditLineValue).to.equal(creditValue)
      expect(result.billRun.debitLineCount).to.equal(1)
      expect(result.billRun.debitLineValue).to.equal(debitValue)
      expect(result.billRun.netTotal).to.equal(debitValue - creditValue)
    })

    describe('When the bill run has not been generated', () => {
      it("doesn't return invoice-level info", async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, payload.region, 'NOT_GENERATED')

        const result = await ViewBillRunService.go(generatingBillRun.id)

        expect(result.billRun.creditNoteCount).to.not.exist()
        expect(result.billRun.creditNoteValue).to.not.exist()
        expect(result.billRun.invoiceCount).to.not.exist()
        expect(result.billRun.invoiceValue).to.not.exist()
      })
    })

    describe('When the bill run has been generated', () => {
      it('returns invoice-level info', async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, payload.region, 'generated')

        const result = await ViewBillRunService.go(generatingBillRun.id)

        expect(result.billRun.creditNoteCount).to.exist()
        expect(result.billRun.creditNoteValue).to.exist()
        expect(result.billRun.invoiceCount).to.exist()
        expect(result.billRun.invoiceValue).to.exist()
      })
    })
  })

  describe('When there is no matching bill run', () => {
    it('throws an error', async () => {
      const unknownBillRunId = GeneralHelper.uuid4()
      const err = await expect(ViewBillRunService.go(unknownBillRunId)).to.reject()

      expect(err).to.be.an.error()
      expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
    })
  })
})
