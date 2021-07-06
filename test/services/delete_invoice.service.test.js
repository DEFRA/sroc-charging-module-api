// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import RulesServiceHelper from '../support/helpers/rules_service.helper.js'

// Things we need to stub
import RulesService from '../../app/services/rules.service.js'

// Additional dependencies needed
import BillRunModel from '../../app/models/bill_run.model.js'
import CreateTransactionService from '../../app/services/create_transaction.service.js'
import GenerateBillRunService from '../../app/services/generate_bill_run.service.js'
import InvoiceModel from '../../app/models/invoice.model.js'
import LicenceModel from '../../app/models/licence.model.js'
import TransactionModel from '../../app/models/transaction.model.js'

// Thing under test
import DeleteInvoiceService from '../../app/services/delete_invoice.service.js'

// Fixtures
import * as fixtures from '../support/fixtures/fixtures.js'
const chargeFixtures = fixtures.calculateCharge
const requestFixtures = fixtures.createTransaction

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Delete Invoice service', () => {
  const rulesServiceResponse = chargeFixtures.presroc.simple
  let billRun
  let authorisedSystem
  let regime
  let payload
  let invoice
  let rulesServiceStub
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)

    rulesServiceStub = Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid invoice is supplied', () => {
    describe("and it's a debit invoice", () => {
      beforeEach(async () => {
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('updates the bill run values', async () => {
        // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
        await GenerateBillRunService.go(billRun)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
        expect(result.invoiceCount).to.equal(0)
        expect(result.invoiceValue).to.equal(0)
      })

      it('deletes the invoice licences', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a credit invoice", () => {
      beforeEach(async () => {
        await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('updates the bill run values', async () => {
        // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
        await GenerateBillRunService.go(billRun)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.creditLineCount).to.equal(0)
        expect(result.creditLineValue).to.equal(0)
        expect(result.creditNoteCount).to.equal(0)
        expect(result.creditNoteValue).to.equal(0)
      })

      it('deletes the invoice licences', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a zero value invoice", () => {
      beforeEach(async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 0)
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('updates the bill run values', async () => {
        // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
        await GenerateBillRunService.go(billRun)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.zeroLineCount).to.equal(0)
      })

      it('deletes the invoice licences', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a minimum charge debit invoice", () => {
      beforeEach(async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 500)
        await CreateTransactionService.go({
          ...payload,
          subjectToMinimumCharge: true
        }, billRun, authorisedSystem, regime)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('updates the bill run values', async () => {
        // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
        await GenerateBillRunService.go(billRun)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
        expect(result.subjectToMinimumChargeCount).to.equal(0)
        expect(result.subjectToMinimumChargeDebitValue).to.equal(0)
        expect(result.invoiceCount).to.equal(0)
        expect(result.invoiceValue).to.equal(0)
      })

      it('deletes the invoice licences', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a minimum charge credit invoice", () => {
      beforeEach(async () => {
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 500)
        await CreateTransactionService.go({
          ...payload,
          subjectToMinimumCharge: true,
          credit: true
        }, billRun, authorisedSystem, regime)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('updates the bill run values', async () => {
        // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
        await GenerateBillRunService.go(billRun)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.creditLineCount).to.equal(0)
        expect(result.creditLineValue).to.equal(0)
        expect(result.subjectToMinimumChargeCount).to.equal(0)
        expect(result.subjectToMinimumChargeCreditValue).to.equal(0)
        expect(result.creditNoteCount).to.equal(0)
        expect(result.creditNoteValue).to.equal(0)
      })

      it('deletes the invoice licences', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
        expect(transactions).to.be.empty()
      })
    })

    describe("and it's the only invoice in the bill run", () => {
      beforeEach(async () => {
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
        await billRun.$query().patch({ status: 'NOT_INITIALISED' })
      })

      it("changes the bill run status to 'initialised'", async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('initialised')
      })
    })

    describe('and there are other invoices in the bill run', () => {
      beforeEach(async () => {
        await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
        await CreateTransactionService.go({
          ...payload,
          customerReference: 'SOMEONE_ELSE'
        }, billRun, authorisedSystem, regime)

        invoice = await InvoiceModel.query().findOne({
          billRunId: billRun.id,
          customerReference: payload.customerReference
        })

        await billRun.$query().patch({ status: 'NOT_INITIALISED' })
      })

      it('leaves the bill run status as-is', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('NOT_INITIALISED')
      })
    })
  })

  describe('When an error occurs', () => {
    it('calls the notifier', async () => {
      const unknownInvoiceId = GeneralHelper.uuid4()
      const unknownBillRunId = GeneralHelper.uuid4()
      await DeleteInvoiceService.go(unknownInvoiceId, unknownBillRunId, notifierFake)

      expect(notifierFake.omfg.callCount).to.equal(1)
      expect(notifierFake.omfg.firstArg).to.equal('Error deleting invoice')
    })
  })
})
