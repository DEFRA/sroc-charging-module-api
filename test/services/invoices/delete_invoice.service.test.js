'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  DatabaseHelper,
  GeneralHelper,
  NewTransactionHelper,
  NewInvoiceHelper,
  NewLicenceHelper
} = require('../../support/helpers')

const {
  BillRunModel,
  InvoiceModel,
  LicenceModel,
  TransactionModel
} = require('../../../app/models')

const { GenerateBillRunService } = require('../../../app/services')

// Thing under test
const { DeleteInvoiceService } = require('../../../app/services')

describe('Delete Invoice service', () => {
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid invoice is supplied', () => {
    let transaction
    let invoice
    let billRun

    describe("and it's a debit invoice", () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create()
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)
      })

      describe("when the bill run is 'generated'", () => {
        it('updates the bill run values correctly', async () => {
          // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
          await GenerateBillRunService.go(billRun)
          invoice = await invoice.$query()

          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.debitLineCount).to.equal(0)
          expect(billRun.debitLineValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      describe("when the bill run is not 'generated'", () => {
        it('updates the bill run values correctly', async () => {
          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.debitLineCount).to.equal(0)
          expect(billRun.debitLineValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('deletes the invoice licences', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ invoiceId: invoice.id })

        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ invoiceId: invoice.id })

        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a credit invoice", () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create(null, { chargeCredit: true })
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)
      })

      describe("when the bill run is 'generated'", () => {
        it('updates the bill run values', async () => {
          // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
          await GenerateBillRunService.go(billRun)
          invoice = await invoice.$query()

          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.creditLineCount).to.equal(0)
          expect(billRun.creditLineValue).to.equal(0)
          expect(billRun.creditNoteCount).to.equal(0)
          expect(billRun.creditNoteValue).to.equal(0)
        })
      })

      describe("when the bill run is not 'generated'", () => {
        it('updates the bill run values correctly', async () => {
          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.creditLineCount).to.equal(0)
          expect(billRun.creditLineValue).to.equal(0)
          expect(billRun.creditNoteCount).to.equal(0)
          expect(billRun.creditNoteValue).to.equal(0)
        })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('deletes the invoice licences', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ invoiceId: invoice.id })

        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ invoiceId: invoice.id })

        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a zero value invoice", () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create(null, { chargeValue: 0 })
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)
      })

      describe("when the bill run is 'generated'", () => {
        it('updates the bill run values', async () => {
          // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
          await GenerateBillRunService.go(billRun)
          invoice = await invoice.$query()

          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.zeroLineCount).to.equal(0)
          expect(billRun.creditNoteCount).to.equal(0)
          expect(billRun.creditNoteValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      describe("when the bill run is not 'generated'", () => {
        it('updates the bill run values correctly', async () => {
          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.zeroLineCount).to.equal(0)
          expect(billRun.creditNoteCount).to.equal(0)
          expect(billRun.creditNoteValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('deletes the invoice licences', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ invoiceId: invoice.id })

        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ invoiceId: invoice.id })

        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a deminimis invoice", () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create(null, { chargeValue: 499 })
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)
      })

      describe("when the bill run is 'generated'", () => {
        it('updates the bill run values', async () => {
          // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
          await GenerateBillRunService.go(billRun)
          invoice = await invoice.$query()

          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.debitLineCount).to.equal(0)
          expect(billRun.debitLineValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      describe("when the bill run is not 'generated'", () => {
        it('updates the bill run values correctly', async () => {
          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.debitLineCount).to.equal(0)
          expect(billRun.debitLineValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('deletes the invoice licences', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ invoiceId: invoice.id })

        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ invoiceId: invoice.id })

        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a minimum charge debit invoice", () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create(null, { subjectToMinimumCharge: true })
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)
      })

      describe("when the bill run is 'generated'", () => {
        it('updates the bill run values', async () => {
          // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
          await GenerateBillRunService.go(billRun)
          invoice = await invoice.$query()

          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.debitLineCount).to.equal(0)
          expect(billRun.debitLineValue).to.equal(0)
          expect(billRun.subjectToMinimumChargeCount).to.equal(0)
          expect(billRun.subjectToMinimumChargeDebitValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      describe("when the bill run is not 'generated'", () => {
        it('updates the bill run values correctly', async () => {
          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.debitLineCount).to.equal(0)
          expect(billRun.debitLineValue).to.equal(0)
          expect(billRun.subjectToMinimumChargeCount).to.equal(0)
          expect(billRun.subjectToMinimumChargeDebitValue).to.equal(0)
          expect(billRun.invoiceCount).to.equal(0)
          expect(billRun.invoiceValue).to.equal(0)
        })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('deletes the invoice licences', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ invoiceId: invoice.id })

        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ invoiceId: invoice.id })

        expect(transactions).to.be.empty()
      })
    })

    describe("and it's a minimum charge credit invoice", () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create(null, { subjectToMinimumCharge: true, chargeCredit: true })
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)
      })

      describe("when the bill run is 'generated'", () => {
        it('updates the bill run values', async () => {
          // We generate the bill run and retrieve the invoice again to ensure that the invoice-level figures are updated
          await GenerateBillRunService.go(billRun)
          invoice = await invoice.$query()

          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.creditLineCount).to.equal(0)
          expect(billRun.creditLineValue).to.equal(0)
          expect(billRun.subjectToMinimumChargeCount).to.equal(0)
          expect(billRun.subjectToMinimumChargeCreditValue).to.equal(0)
          expect(billRun.creditNoteCount).to.equal(0)
          expect(billRun.creditNoteValue).to.equal(0)
        })
      })

      describe("when the bill run is not 'generated'", () => {
        it('updates the bill run values correctly', async () => {
          await DeleteInvoiceService.go(invoice, billRun.id)

          billRun = await billRun.$query()

          expect(billRun.creditLineCount).to.equal(0)
          expect(billRun.creditLineValue).to.equal(0)
          expect(billRun.subjectToMinimumChargeCount).to.equal(0)
          expect(billRun.subjectToMinimumChargeCreditValue).to.equal(0)
          expect(billRun.creditNoteCount).to.equal(0)
          expect(billRun.creditNoteValue).to.equal(0)
        })
      })

      it('deletes the invoice', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const result = await InvoiceModel.query().findById(invoice.id)

        expect(result).to.not.exist()
      })

      it('deletes the invoice licences', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const licences = await LicenceModel.query().select().where({ invoiceId: invoice.id })

        expect(licences).to.be.empty()
      })

      it('deletes the invoice transactions', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        const transactions = await TransactionModel.query().select().where({ invoiceId: invoice.id })

        expect(transactions).to.be.empty()
      })
    })

    describe("and it's the only invoice in the bill run", () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create()
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)

        await billRun.$query().patch({ status: 'NOT_INITIALISED' })
      })

      it("changes the bill run status to 'initialised'", async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        billRun = await billRun.$query()

        expect(billRun.status).to.equal('initialised')
      })
    })

    describe('and there are other invoices in the bill run', () => {
      beforeEach(async () => {
        transaction = await NewTransactionHelper.create()
        invoice = await InvoiceModel.query().findById(transaction.invoiceId)
        billRun = await BillRunModel.query().findById(transaction.billRunId)
        await billRun.$query().patch({ status: 'NOT_INITIALISED' })

        const otherInvoice = await NewInvoiceHelper.create(billRun, { customerReference: 'SOMEONE_ELSE' })
        const otherLicence = await NewLicenceHelper.create(otherInvoice, { licenceNumber: 'OTHER_LICENCE' })
        await NewTransactionHelper.create(otherLicence, { customerReference: 'SOMEONE_ELSE' })
      })

      it('leaves the bill run status as-is', async () => {
        await DeleteInvoiceService.go(invoice, billRun.id)

        billRun = await billRun.$query()

        expect(billRun.status).to.equal('NOT_INITIALISED')
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
