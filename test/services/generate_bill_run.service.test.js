'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  InvoiceHelper,
  RegimeHelper,
  RulesServiceHelper
} = require('../support/helpers')

const { BillRunModel, InvoiceModel } = require('../../app/models')

const { CreateTransactionService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { GenerateBillRunService } = require('../../app/services')

describe('Generate Bill Run Summary service', () => {
  const customerReference = 'A11111111A'

  let billRun
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
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      Sinon.stub(RulesService, 'go').returns(chargeFixtures.simple.rulesService)
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
    })

    it("sets the bill run status to 'generating'", async () => {
      const result = await GenerateBillRunService.go(billRun.id)

      expect(result.status).to.equal('generating')
    })

    describe('When there is a zero value invoice', () => {
      it("sets the 'summarised' flag to true", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 0, 0, 0, 0, 1)
        await GenerateBillRunService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })

      describe('and there is also a non-zero value invoice', () => {
        it("leaves the 'summarised' flag of the non-zero value invoice as false", async () => {
          await InvoiceHelper.addInvoice(billRun.id, customerReference, 2020, 0, 0, 0, 0, 1)
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 1000, 1, 200, 1)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })
    })

    describe('When deminimis applies', () => {
      it("sets the 'summarised' flag to true", async () => {
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 600, 1, 300, 0)
        await GenerateBillRunService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })
    })

    describe('When deminimis does not apply', () => {
      describe('Because the invoice net value is over 500', () => {
        it("leaves the 'summarised' flag as false", async () => {
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 900, 1, 300, 0)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })

      describe('Because the invoice net value is under 0', () => {
        it("leaves the 'summarised' flag as false", async () => {
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 100, 1, 300, 0)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })
    })

    describe.only('When minimum charge applies', () => {
      it('saves the adjustment transaction to the db', async () => {
        await GenerateBillRunService.go(billRun.id)

        const { transactions } = await BillRunModel.query()
          .findById(billRun.id)
          .withGraphFetched('invoices')
          .withGraphFetched('transactions')

        const adjustmentTransactions = transactions.filter((transaction) => {
          return transaction.minimumChargeAdjustment
        })

        expect(adjustmentTransactions.length).to.equal(1)
      })
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    describe('because no matching bill run exists', () => {
      it('throws an error', async () => {
        const unknownBillRunId = '05f32bd9-7bce-42c2-8d6a-b14a8e26d531'

        const err = await expect(GenerateBillRunService.go(unknownBillRunId)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
      })
    })

    describe('because the bill run is already generating', () => {
      it('throws an error', async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'generating')
        const err = await expect(GenerateBillRunService.go(generatingBillRun.id)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${generatingBillRun.id} is already being generated`)
      })
    })

    describe('because the bill run is not editable', () => {
      it('throws an error', async () => {
        const notEditableStatus = 'NOT_EDITABLE'
        const notEditableBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', notEditableStatus)
        const err = await expect(GenerateBillRunService.go(notEditableBillRun.id)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${notEditableBillRun.id} cannot be edited because its status is ${notEditableStatus}.`)
      })
    })
  })
})
