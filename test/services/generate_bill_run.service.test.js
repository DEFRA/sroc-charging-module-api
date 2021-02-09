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

const { BillRunModel, InvoiceModel, TransactionModel } = require('../../app/models')

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
      const spy = Sinon.spy(BillRunModel, 'query')
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      await GenerateBillRunService.go(billRun.id)

      /**
       * Iterate over each query call to get the underlying SQL query:
       *   .getCall gives us the given call
       *   The Objection function we spy on returns a query object so we get the returnValue
       *   .toKnexQuery() gives us the underlying Knex query
       *   .toString() gives us the SQL query as a string
       *
       * Finally, we push query strings to the queries array if they set the status to 'generating'.
       */
      const queries = []
      for (let call = 0; call < spy.callCount; call++) {
        const queryString = spy.getCall(call).returnValue.toKnexQuery().toString()
        if (queryString.includes('set "status" = \'generating\'')) {
          queries.push(queryString)
        }
      }

      expect(queries.length).to.equal(1)
    })

    it("sets the bill run status to 'generated' on completion", async () => {
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
      await GenerateBillRunService.go(billRun.id)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.status).to.equal('generated')
    })

    it('correctly summarises debit invoices', async () => {
      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 50000)
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun.id)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.invoiceCount).to.equal(1)
      expect(result.invoiceValue).to.equal(50000)
    })

    it('correctly summarises credit invoices', async () => {
      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 50000)
      await CreateTransactionService.go({ ...payload, credit: true }, billRun.id, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun.id)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.creditNoteCount).to.equal(1)
      expect(result.creditNoteValue).to.equal(50000)
    })

    describe('When there are zero value invoices', () => {
      it("sets the 'zeroValueInvoice' flag to true", async () => {
        await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 0, 0, 0, 0, 1)
        await GenerateBillRunService.go(billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.zeroValueInvoice).to.equal(true)
      })

      it('correctly summarises zero value invoices', async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 0)

        // We add 2 zero value transactions so we can ensure the bill run contains the number of zero value transactions
        // rather than invoices
        await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
        await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

        await GenerateBillRunService.go(billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.zeroCount).to.equal(2)
      })

      describe('and there is also a non-zero value invoice', () => {
        it("leaves the 'zeroValueInvoice' flag of the non-zero value invoice as false", async () => {
          await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
          await InvoiceHelper.addInvoice(billRun.id, customerReference, 2020, 0, 0, 0, 0, 1)
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 1000, 1, 200, 1)
          await GenerateBillRunService.go(billRun.id)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.zeroValueInvoice).to.equal(false)
        })
      })
    })

    describe('When deminimis applies', () => {
      it("sets the 'deminimisInvoice' flag to true", async () => {
        payload.volume = '1.22' // should result in a charge of 223
        let result = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
        await GenerateBillRunService.go(billRun.id)

        result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
        const invoice = await InvoiceModel.query().findById(result.invoiceId)

        expect(invoice.deminimisInvoice).to.equal(true)
      })
    })

    describe('When deminimis does not apply', () => {
      describe('because the invoice net value is over 500', () => {
        it("leaves the 'deminimisInvoice' flag as false", async () => {
          let result = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun.id)

          result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
          const invoice = await InvoiceModel.query().findById(result.invoiceId)

          expect(invoice.deminimisInvoice).to.equal(false)
        })
      })

      describe('because the invoice net value is under 0', () => {
        it("leaves the 'deminimisInvoice' flag as false", async () => {
          payload.credit = true
          let result = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun.id)

          result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
          const invoice = await InvoiceModel.query().findById(result.invoiceId)

          expect(invoice.deminimisInvoice).to.equal(false)
        })
      })

      describe('because the invoice is subject to minimum charge', () => {
        it("leaves the 'deminimisInvoice' flag as false", async () => {
          payload.subjectToMinimumCharge = true
          let result = await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun.id)

          result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
          const invoice = await InvoiceModel.query().findById(result.invoiceId)

          expect(invoice.deminimisInvoice).to.equal(false)
        })
      })
    })

    describe('When minimum charge applies', () => {
      it('saves the adjustment transaction to the db', async () => {
        await CreateTransactionService.go({ ...payload, subjectToMinimumCharge: true }, billRun.id, authorisedSystem, regime)
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

    it('calls the info method of the provided logger', async () => {
      const loggerFake = { info: Sinon.fake() }
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun.id, loggerFake)

      expect(loggerFake.info.callCount).to.equal(1)
    })
  })
})
