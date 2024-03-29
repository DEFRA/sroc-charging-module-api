'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper.js')
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const InvoiceHelper = require('../../support/helpers/invoice.helper.js')
const RegimeHelper = require('../../support/helpers/regime.helper.js')
const RulesServiceHelper = require('../../support/helpers/rules_service.helper.js')

const BillRunModel = require('../../../app/models/bill_run.model.js')
const InvoiceModel = require('../../../app/models/invoice.model.js')
const TransactionModel = require('../../../app/models/transaction.model.js')

const CreateTransactionService = require('../../../app/services/transactions/create_transaction.service.js')

const { presroc: requestFixtures } = require('../../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const RequestRulesServiceCharge = require('../../../app/services/charges/request_rules_service_charge.service.js')

// Thing under test
const GenerateBillRunService = require('../../../app/services/bill_runs/generate_bill_run.service.js')

describe('Generate Bill Run service', () => {
  const customerReference = 'A11111111A'

  let billRun
  let authorisedSystem
  let regime
  let payload
  let rulesServiceStub
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // Create a fake for use in tests that want to know if the service attempted to log anything
    notifierFake = { omg: Sinon.fake(), omfg: Sinon.fake() }

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)
  })

  afterEach(async () => {
    Sinon.restore()
    Sinon.resetHistory()
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      rulesServiceStub = Sinon.stub(RequestRulesServiceCharge, 'go').returns(rulesServiceResponse)
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    })

    it("sets the bill run status to 'pending'", async () => {
      const spy = Sinon.spy(BillRunModel, 'query')
      await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
      await GenerateBillRunService.go(billRun)

      /**
       * Iterate over each query call to get the underlying SQL query:
       *   .getCall gives us the given call
       *   The Objection function we spy on returns a query object so we get the returnValue
       *   .toKnexQuery() gives us the underlying Knex query
       *   .toString() gives us the SQL query as a string
       *
       * Finally, we push query strings to the queries array if they set the status to 'pending'.
       */
      const queries = []
      for (let call = 0; call < spy.callCount; call++) {
        const queryString = spy.getCall(call).returnValue.toKnexQuery().toString()
        if (queryString.includes('set "status" = \'pending\'')) {
          queries.push(queryString)
        }
      }

      expect(queries.length).to.equal(1)
    })

    it("sets the bill run status to 'generated' on completion", async () => {
      await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
      await GenerateBillRunService.go(billRun)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.status).to.equal('generated')
    })

    it('correctly summarises debit invoices', async () => {
      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 50000)
      await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.invoiceCount).to.equal(1)
      expect(result.invoiceValue).to.equal(50000)
    })

    it('correctly summarises credit invoices', async () => {
      rulesServiceStub.restore()
      RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 50000)
      await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result.creditNoteCount).to.equal(1)
      expect(result.creditNoteValue).to.equal(50000)
    })

    it("logs the time taken using the provided 'notifier'", async () => {
      await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

      await GenerateBillRunService.go(billRun, notifierFake)

      expect(notifierFake.omg.callCount).to.equal(1)
    })

    // These tests are for zero value invoices, ie. which only contain zero-value transactions
    describe('When there are zero value invoices', () => {
      it("sets the 'zeroValueInvoice' flag to true", async () => {
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 0, 0, 0, 0, 1)
        await GenerateBillRunService.go(billRun)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.zeroValueInvoice).to.equal(true)
      })

      it('correctly summarises zero value invoices', async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 0)

        // We add 2 zero value transactions so we can ensure the bill run contains the number of zero value transactions
        // rather than invoices
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

        await GenerateBillRunService.go(billRun)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.zeroLineCount).to.equal(2)
      })

      describe('and there is also a non-zero value invoice', () => {
        it("leaves the 'zeroValueInvoice' flag of the non-zero value invoice as false", async () => {
          await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          await InvoiceHelper.addInvoice(billRun.id, customerReference, 2020, 0, 0, 0, 0, 1)
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 1000, 1, 200, 1)
          await GenerateBillRunService.go(billRun)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.zeroValueInvoice).to.equal(false)
        })
      })
    })

    describe('When there are no zero value invoices', () => {
      describe('and the invoice was previously zero value', () => {
        it("sets the 'zeroValueInvoice' flag to false", async () => {
          // Create a zero value invoice and generate the bill run
          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 0)
          let result = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun)

          // Add a non-zero value transaction to the invoice and generate again
          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 500)
          await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun)

          result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
          const invoice = await InvoiceModel.query().findById(result.invoiceId)

          expect(invoice.zeroValueInvoice).to.equal(false)
        })
      })
    })

    // These tests are for net zero value invoices, ie. where the net total of the invoice is zero
    describe('When there are net zero value invoices', () => {
      it("sets the 'zeroValueInvoice' flag to true", async () => {
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 1000, 1, 1000, 0)
        await GenerateBillRunService.go(billRun)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result.zeroValueInvoice).to.equal(true)
      })

      describe('and there is also a non-net zero value invoice', () => {
        it("leaves the 'zeroValueInvoice' flag of the non-zero value invoice as false", async () => {
          await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          await InvoiceHelper.addInvoice(billRun.id, customerReference, 2020, 1, 1000, 1, 1000, 0)
          const invoice = await InvoiceHelper.addInvoice(billRun.id, customerReference, 2021, 1, 1000, 1, 200, 1)
          await GenerateBillRunService.go(billRun)

          const result = await InvoiceModel.query().findById(invoice.id)

          expect(result.zeroValueInvoice).to.equal(false)
        })
      })
    })

    describe('When deminimis applies', () => {
      it("sets the 'deminimisInvoice' flag to true", async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 499)
        let result = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        await GenerateBillRunService.go(billRun)

        result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
        const invoice = await InvoiceModel.query().findById(result.invoiceId)

        expect(invoice.deminimisInvoice).to.equal(true)
      })

      it('correctly summarises debit invoices', async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 499)
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

        await GenerateBillRunService.go(billRun)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.invoiceCount).to.equal(0)
        expect(result.invoiceValue).to.equal(0)
      })

      it('correctly summarises a debit invoice containing a credit', async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 499)
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)

        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 250)
        await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)

        await GenerateBillRunService.go(billRun)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.invoiceCount).to.equal(0)
        expect(result.invoiceValue).to.equal(0)
      })
    })

    describe('When deminimis does not apply', () => {
      describe('because the invoice net value is over 500', () => {
        it("leaves the 'deminimisInvoice' flag as false", async () => {
          let result = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun)

          result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
          const invoice = await InvoiceModel.query().findById(result.invoiceId)

          expect(invoice.deminimisInvoice).to.equal(false)
        })

        describe('and the invoice was previously deminimis', () => {
          it("sets the 'deminimisInvoice' flag to false", async () => {
            // Create a deminimis invoice and generate the bill run
            rulesServiceStub.restore()
            RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 499)
            let result = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
            await GenerateBillRunService.go(billRun)

            // Add another transaction to take the invoice out of deminimis and generate again
            await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
            await GenerateBillRunService.go(billRun)

            result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
            const invoice = await InvoiceModel.query().findById(result.invoiceId)

            expect(invoice.deminimisInvoice).to.equal(false)
          })
        })
      })

      describe('because the invoice net value is under 0', () => {
        it("leaves the 'deminimisInvoice' flag as false", async () => {
          payload.credit = true
          let result = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun)

          result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
          const invoice = await InvoiceModel.query().findById(result.invoiceId)

          expect(invoice.deminimisInvoice).to.equal(false)
        })
      })

      describe('because the invoice is subject to minimum charge', () => {
        it("leaves the 'deminimisInvoice' flag as false", async () => {
          payload.subjectToMinimumCharge = true
          let result = await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
          await GenerateBillRunService.go(billRun)

          result = await TransactionModel.query().select('invoiceId').findById(result.transaction.id)
          const invoice = await InvoiceModel.query().findById(result.invoiceId)

          expect(invoice.deminimisInvoice).to.equal(false)
        })
      })
    })

    describe('When minimum charge applies', () => {
      describe('with one transaction in the invoice', () => {
        let minimumChargeBill

        describe("and only a 'credit' adjustment transaction is needed", () => {
          beforeEach(async () => {
            const minimumChargePayload = {
              ...payload,
              credit: true,
              subjectToMinimumCharge: true
            }

            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)

            await GenerateBillRunService.go(billRun)

            minimumChargeBill = await BillRunModel.query().findById(billRun.id)
          })

          it("saves just the 'credit' adjustment transaction to the db", async () => {
            const { transactions } = await BillRunModel.query()
              .findById(billRun.id)
              .withGraphFetched('invoices')
              .withGraphFetched('transactions')

            const adjustmentTransactions = transactions.filter((transaction) => {
              return transaction.minimumChargeAdjustment
            })

            expect(adjustmentTransactions.length).to.equal(1)
            expect(adjustmentTransactions[0].chargeCredit).to.be.true()
          })

          it("updates the 'bill run' as expected", async () => {
            expect(minimumChargeBill.creditLineCount).to.equal(2)
            expect(minimumChargeBill.creditLineValue).to.equal(2500)
            expect(minimumChargeBill.debitLineCount).to.equal(0)
            expect(minimumChargeBill.debitLineValue).to.equal(0)
            expect(minimumChargeBill.subjectToMinimumChargeCount).to.equal(2)
            expect(minimumChargeBill.subjectToMinimumChargeCreditValue).to.equal(2500)
            expect(minimumChargeBill.subjectToMinimumChargeDebitValue).to.equal(0)
            expect(minimumChargeBill.creditNoteCount).to.equal(1)
            expect(minimumChargeBill.creditNoteValue).to.equal(2500)
            expect(minimumChargeBill.invoiceCount).to.equal(0)
            expect(minimumChargeBill.invoiceValue).to.equal(0)
          })

          it("updates the 'invoice' as expected", async () => {
            const invoices = await minimumChargeBill.$relatedQuery('invoices')
            const minimumChargeInvoice = invoices[0]

            expect(minimumChargeInvoice.creditLineCount).to.equal(2)
            expect(minimumChargeInvoice.creditLineValue).to.equal(2500)
            expect(minimumChargeInvoice.debitLineCount).to.equal(0)
            expect(minimumChargeInvoice.debitLineValue).to.equal(0)
            expect(minimumChargeInvoice.subjectToMinimumChargeCount).to.equal(2)
            expect(minimumChargeInvoice.subjectToMinimumChargeCreditValue).to.equal(2500)
            expect(minimumChargeInvoice.subjectToMinimumChargeDebitValue).to.equal(0)
            expect(minimumChargeInvoice.minimumChargeInvoice).to.equal(true)
          })

          it("updates the 'licence' as expected", async () => {
            const licences = await minimumChargeBill.$relatedQuery('licences')
            const minimumChargeLicence = licences[0]

            expect(minimumChargeLicence.creditLineCount).to.equal(2)
            expect(minimumChargeLicence.creditLineValue).to.equal(2500)
            expect(minimumChargeLicence.debitLineCount).to.equal(0)
            expect(minimumChargeLicence.debitLineValue).to.equal(0)
            expect(minimumChargeLicence.subjectToMinimumChargeCount).to.equal(2)
            expect(minimumChargeLicence.subjectToMinimumChargeCreditValue).to.equal(2500)
            expect(minimumChargeLicence.subjectToMinimumChargeDebitValue).to.equal(0)
          })
        })

        describe("and only a 'debit' adjustment transaction is needed", () => {
          beforeEach(async () => {
            const minimumChargePayload = {
              ...payload,
              subjectToMinimumCharge: true
            }

            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)

            await GenerateBillRunService.go(billRun)

            minimumChargeBill = await BillRunModel.query().findById(billRun.id)
          })

          it("saves just the 'debit' adjustment transaction to the db", async () => {
            const { transactions } = await BillRunModel.query()
              .findById(billRun.id)
              .withGraphFetched('invoices')
              .withGraphFetched('transactions')

            const adjustmentTransactions = transactions.filter((transaction) => {
              return transaction.minimumChargeAdjustment
            })

            expect(adjustmentTransactions.length).to.equal(1)
            expect(adjustmentTransactions[0].chargeCredit).to.be.false()
          })

          it("updates the 'bill run' as expected", async () => {
            expect(minimumChargeBill.creditLineCount).to.equal(0)
            expect(minimumChargeBill.creditLineValue).to.equal(0)
            expect(minimumChargeBill.debitLineCount).to.equal(2)
            expect(minimumChargeBill.debitLineValue).to.equal(2500)
            expect(minimumChargeBill.subjectToMinimumChargeCount).to.equal(2)
            expect(minimumChargeBill.subjectToMinimumChargeCreditValue).to.equal(0)
            expect(minimumChargeBill.subjectToMinimumChargeDebitValue).to.equal(2500)
            expect(minimumChargeBill.creditNoteCount).to.equal(0)
            expect(minimumChargeBill.creditNoteValue).to.equal(0)
            expect(minimumChargeBill.invoiceCount).to.equal(1)
            expect(minimumChargeBill.invoiceValue).to.equal(2500)
          })

          it("updates the 'invoice' as expected", async () => {
            const invoices = await minimumChargeBill.$relatedQuery('invoices')
            const minimumChargeInvoice = invoices[0]

            expect(minimumChargeInvoice.creditLineCount).to.equal(0)
            expect(minimumChargeInvoice.creditLineValue).to.equal(0)
            expect(minimumChargeInvoice.debitLineCount).to.equal(2)
            expect(minimumChargeInvoice.debitLineValue).to.equal(2500)
            expect(minimumChargeInvoice.subjectToMinimumChargeCount).to.equal(2)
            expect(minimumChargeInvoice.subjectToMinimumChargeCreditValue).to.equal(0)
            expect(minimumChargeInvoice.subjectToMinimumChargeDebitValue).to.equal(2500)
            expect(minimumChargeInvoice.minimumChargeInvoice).to.equal(true)
          })

          it("updates the 'licence' as expected", async () => {
            const licences = await minimumChargeBill.$relatedQuery('invoices')
            const minimumChargeLicence = licences[0]

            expect(minimumChargeLicence.creditLineCount).to.equal(0)
            expect(minimumChargeLicence.creditLineValue).to.equal(0)
            expect(minimumChargeLicence.debitLineCount).to.equal(2)
            expect(minimumChargeLicence.debitLineValue).to.equal(2500)
            expect(minimumChargeLicence.subjectToMinimumChargeCount).to.equal(2)
            expect(minimumChargeLicence.subjectToMinimumChargeCreditValue).to.equal(0)
            expect(minimumChargeLicence.subjectToMinimumChargeDebitValue).to.equal(2500)
          })
        })
      })

      describe('with multiple transactions in the invoice', () => {
        describe("and both a 'credit' and 'debit' adjustment transaction is needed", () => {
          beforeEach(async () => {
            const minimumChargePayload = {
              ...payload,
              subjectToMinimumCharge: true
            }
            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)
            minimumChargePayload.credit = true
            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)
            await GenerateBillRunService.go(billRun)
          })

          it('saves both adjustment transactions to the db', async () => {
            // Note that we would normally use .withGraphFetched('invoices.transactions') to pull the invoices and nested
            // transactions from the bill run. However this way of doing it makes it easier to get to the transaction we
            // want to test without having to dig through the object.
            const { transactions } = await BillRunModel.query()
              .findById(billRun.id)
              .withGraphFetched('invoices')
              .withGraphFetched('transactions')

            const adjustmentTransactions = transactions.filter((transaction) => {
              return transaction.minimumChargeAdjustment
            })

            expect(adjustmentTransactions.length).to.equal(2)
          })

          it('updates the bill run as expected', async () => {
            const minimumChargeBill = await BillRunModel.query().findById(billRun.id)

            expect(minimumChargeBill.debitLineCount).to.equal(2)
            expect(minimumChargeBill.creditLineCount).to.equal(2)
            expect(minimumChargeBill.subjectToMinimumChargeCount).to.equal(4)
            expect(minimumChargeBill.subjectToMinimumChargeDebitValue).to.equal(2500)
            expect(minimumChargeBill.subjectToMinimumChargeCreditValue).to.equal(2500)
          })

          it('updates the invoice as expected', async () => {
            const minimumChargeBill = await BillRunModel.query().findById(billRun.id)
            const invoices = await minimumChargeBill.$relatedQuery('invoices')
            const minimumChargeInvoice = invoices[0]

            expect(minimumChargeInvoice.debitLineCount).to.equal(2)
            expect(minimumChargeInvoice.creditLineCount).to.equal(2)
            expect(minimumChargeInvoice.subjectToMinimumChargeCount).to.equal(4)
            expect(minimumChargeInvoice.subjectToMinimumChargeDebitValue).to.equal(2500)
            expect(minimumChargeInvoice.subjectToMinimumChargeCreditValue).to.equal(2500)
            expect(minimumChargeInvoice.minimumChargeInvoice).to.equal(true)
          })

          it('updates the licence as expected', async () => {
            const minimumChargeBill = await BillRunModel.query().findById(billRun.id)
            const licences = await minimumChargeBill.$relatedQuery('licences')
            const minimumChargeLicence = licences[0]

            expect(minimumChargeLicence.debitLineCount).to.equal(2)
            expect(minimumChargeLicence.creditLineCount).to.equal(2)
            expect(minimumChargeLicence.subjectToMinimumChargeCount).to.equal(4)
            expect(minimumChargeLicence.subjectToMinimumChargeDebitValue).to.equal(2500)
            expect(minimumChargeLicence.subjectToMinimumChargeCreditValue).to.equal(2500)
          })
        })

        describe("and only a 'credit' transaction is needed", () => {
          beforeEach(async () => {
            const minimumChargePayload = {
              ...payload,
              credit: true,
              subjectToMinimumCharge: true
            }

            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)

            rulesServiceStub.restore()
            RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 2501)
            minimumChargePayload.credit = false
            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)

            await GenerateBillRunService.go(billRun)
          })

          it("saves just a 'credit' adjustment transaction to the db", async () => {
            const { transactions } = await BillRunModel.query()
              .findById(billRun.id)
              .withGraphFetched('invoices')
              .withGraphFetched('transactions')

            const adjustmentTransactions = transactions.filter((transaction) => {
              return transaction.minimumChargeAdjustment
            })

            expect(adjustmentTransactions.length).to.equal(1)
            expect(adjustmentTransactions[0].chargeCredit).to.be.true()
          })

          it('updates the bill run and invoice as expected', async () => {
            const minimumChargeBill = await BillRunModel.query().findById(billRun.id)
            const invoices = await minimumChargeBill.$relatedQuery('invoices')
            const minimumChargeInvoice = invoices[0]

            expect(minimumChargeBill.debitLineCount).to.equal(1)
            expect(minimumChargeBill.creditLineCount).to.equal(2)
            expect(minimumChargeBill.subjectToMinimumChargeCount).to.equal(3)
            expect(minimumChargeBill.subjectToMinimumChargeDebitValue).to.equal(2501)
            expect(minimumChargeBill.subjectToMinimumChargeCreditValue).to.equal(2500)
            expect(minimumChargeBill.creditNoteCount).to.equal(0)
            expect(minimumChargeBill.creditNoteValue).to.equal(0)

            // We expect invoice count and value to be 0 because the debit value of 2501 minus the credit value of 2500
            // makes this a deminimis invoice and therefore not included in the figures.
            expect(minimumChargeBill.invoiceCount).to.equal(0)
            expect(minimumChargeBill.invoiceValue).to.equal(0)

            expect(minimumChargeInvoice.debitLineCount).to.equal(1)
            expect(minimumChargeInvoice.creditLineCount).to.equal(2)
            expect(minimumChargeInvoice.subjectToMinimumChargeCount).to.equal(3)
            expect(minimumChargeInvoice.subjectToMinimumChargeDebitValue).to.equal(2501)
            expect(minimumChargeInvoice.subjectToMinimumChargeCreditValue).to.equal(2500)
            expect(minimumChargeInvoice.minimumChargeInvoice).to.equal(true)
          })
        })

        describe("and only a 'debit' transaction is needed", () => {
          beforeEach(async () => {
            const minimumChargePayload = {
              ...payload,
              subjectToMinimumCharge: true
            }

            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)

            rulesServiceStub.restore()
            RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 2501)
            minimumChargePayload.credit = true
            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)

            await GenerateBillRunService.go(billRun)
          })

          it("saves just a 'debit' adjustment transaction to the db", async () => {
            const { transactions } = await BillRunModel.query()
              .findById(billRun.id)
              .withGraphFetched('invoices')
              .withGraphFetched('transactions')

            const adjustmentTransactions = transactions.filter((transaction) => {
              return transaction.minimumChargeAdjustment
            })

            expect(adjustmentTransactions.length).to.equal(1)
            expect(adjustmentTransactions[0].chargeCredit).to.be.false()
          })

          it('updates the bill run and invoice as expected', async () => {
            const minimumChargeBill = await BillRunModel.query().findById(billRun.id)
            const invoices = await minimumChargeBill.$relatedQuery('invoices')
            const minimumChargeInvoice = invoices[0]

            expect(minimumChargeBill.debitLineCount).to.equal(2)
            expect(minimumChargeBill.creditLineCount).to.equal(1)
            expect(minimumChargeBill.subjectToMinimumChargeCount).to.equal(3)
            expect(minimumChargeBill.subjectToMinimumChargeDebitValue).to.equal(2500)
            expect(minimumChargeBill.subjectToMinimumChargeCreditValue).to.equal(2501)
            expect(minimumChargeBill.creditNoteCount).to.equal(1)
            expect(minimumChargeBill.creditNoteValue).to.equal(1)
            expect(minimumChargeBill.invoiceCount).to.equal(0)
            expect(minimumChargeBill.invoiceValue).to.equal(0)

            expect(minimumChargeInvoice.debitLineCount).to.equal(2)
            expect(minimumChargeInvoice.creditLineCount).to.equal(1)
            expect(minimumChargeInvoice.subjectToMinimumChargeCount).to.equal(3)
            expect(minimumChargeInvoice.subjectToMinimumChargeDebitValue).to.equal(2500)
            expect(minimumChargeInvoice.subjectToMinimumChargeCreditValue).to.equal(2501)
            expect(minimumChargeInvoice.minimumChargeInvoice).to.equal(true)
          })
        })

        describe('and deminimis applies', () => {
          beforeEach(async () => {
            const minimumChargePayload = {
              ...payload,
              subjectToMinimumCharge: true
            }

            rulesServiceStub.restore()
            RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 1)
            await CreateTransactionService.go(minimumChargePayload, billRun, authorisedSystem, regime)

            rulesServiceStub.restore()
            RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 2365)
            await CreateTransactionService.go({
              ...payload,
              credit: true
            }, billRun, authorisedSystem, regime)

            await GenerateBillRunService.go(billRun)
          })

          it('updates the bill run as expected', async () => {
            const generatedBillRun = await BillRunModel.query().findById(billRun.id)

            expect(generatedBillRun.invoiceCount).to.equal(0)
            expect(generatedBillRun.invoiceValue).to.equal(0)
          })
        })
      })
    })

    describe('When minimum charge does not apply', () => {
      it('does not save an adjustment transaction to the db', async () => {
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        await GenerateBillRunService.go(billRun)

        const { transactions } = await BillRunModel.query()
          .findById(billRun.id)
          .withGraphFetched('invoices')
          .withGraphFetched('transactions')

        const adjustmentTransactions = transactions.filter((transaction) => {
          return transaction.minimumChargeAdjustment
        })

        expect(adjustmentTransactions.length).to.equal(0)
      })

      it('does not set the minimumChargeInvoice flag to true', async () => {
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        await GenerateBillRunService.go(billRun)

        const { invoices } = await BillRunModel.query()
          .findById(billRun.id)
          .withGraphFetched('invoices')

        expect(invoices[0].minimumChargeInvoice).to.equal(false)
      })
    })
  })

  describe('If an error is thrown', () => {
    it("gets logged and recorded but is not allowed to 'bubble' up", async () => {
      const spy = Sinon.spy(GenerateBillRunService, '_notifyError')

      await expect(GenerateBillRunService.go({}, notifierFake)).not.to.reject()
      expect(notifierFake.omfg.callCount).to.equal(1)
      expect(spy.calledOnce).to.be.true()
    })
  })
})
