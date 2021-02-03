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

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      rulesServiceStub = Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    })

    it("sets the bill run status to 'generating'", async () => {
      /**
       * We want to know that the status changes during generation. To test this while assuming no knowledge about how
       * it works (ie. mocking services it calls to introduce a delay) we read the initial bill run status, start
       * GenerateBillRunService running, then monitor the status until it changes then test that the new status matches
       * the expected result. We then wait until the status changes again to ensure that the process has finished before
       * moving to the next test.
       */

      // const initialStatus = billRun.status

      // GenerateBillRunService.go(billRun.id)

      // let newStatus
      // do {
      //   const result = await BillRunModel.query().findById(billRun.id)
      //   newStatus = result.status
      // } while (newStatus === initialStatus)
      // expect(newStatus).to.equal('generating')

      // let endStatus
      // do {
      //   const result = await BillRunModel.query().findById(billRun.id)
      //   endStatus = result.status
      // } while (endStatus === newStatus)

      // ----------------------------------------

      const spy = Sinon.spy(BillRunModel, 'query')

      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      await GenerateBillRunService.go(billRun.id)

      // Iterate over each query call and put the raw SQL text into an array:
      //   .getCall gives us the given call
      //   The Objection function we spy on returns a query object so we get the returnValue
      //   .toKnexQuery() gives us the underlying Knex query
      //   .toString() gives us the SQL query as a string
      const queries = []
      for (let call = 0; call < spy.callCount; call++) {
        const queryString = spy.getCall(call).returnValue.toKnexQuery().toString()
        queries.push(queryString)
      }

      // Filter out any that don't set the status to generating and we should end up with 1 query
      const generatingQueries = queries.filter(query => query.includes('set "status" = \'generating\''))
      expect(generatingQueries.length).to.equal(1)
    })

    it("sets the bill run status to 'generated' on completion", async () => {
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      await GenerateBillRunService.go(billRun.id)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.status).to.equal('generated')
    })

    it('correctly summarises debit invoices', async () => {
      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 500)
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun.id)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.invoiceCount).to.equal(1)
      expect(result.invoiceValue).to.equal(50000)
    })

    it('correctly summarises credit invoices', async () => {
      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 500)
      await CreateTransactionService.go({ ...payload, credit: true }, billRun.id, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun.id)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.creditNoteCount).to.equal(1)
      expect(result.creditNoteValue).to.equal(50000)
    })

    describe('When there is a zero value invoice', () => {
      it("sets the 'summarised' flag to true", async () => {
        await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 0, 0, 0, 0, 1)
        await GenerateBillRunService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })

      it('correctly summarises zero value invoices', async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 0)
        await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

        await GenerateBillRunService.go(billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.zeroCount).to.equal(1)
      })

      describe('and there is also a non-zero value invoice', () => {
        it("leaves the 'summarised' flag of the non-zero value invoice as false", async () => {
          await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
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
        await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 600, 1, 300, 0)
        await GenerateBillRunService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.summarised).to.equal(true)
      })
    })

    describe('When deminimis does not apply', () => {
      describe('Because the invoice net value is over 500', () => {
        it("leaves the 'summarised' flag as false", async () => {
          await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 900, 1, 300, 0)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })

      describe('Because the invoice net value is under 0', () => {
        it("leaves the 'summarised' flag as false", async () => {
          await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 100, 1, 300, 0)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.summarised).to.equal(false)
        })
      })
    })

    describe('When minimum charge applies', () => {
      it('saves the adjustment transaction to the db', async () => {
        await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
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
        const unknownBillRunId = GeneralHelper.uuid4()

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
