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
  NewLicenceHelper,
  NewTransactionHelper,
  NewInvoiceHelper
} = require('../../support/helpers')

const {
  BillRunModel,
  InvoiceModel,
  LicenceModel,
  TransactionModel
} = require('../../../app/models')

const { GenerateBillRunService } = require('../../../app/services')

// Thing under test
const { DeleteLicenceService } = require('../../../app/services')

describe('Delete Licence service', () => {
  let billRun
  let invoice
  let licence
  let transaction
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    transaction = await NewTransactionHelper.create()
    licence = await LicenceModel.query().findById(transaction.licenceId)
    invoice = await InvoiceModel.query().findById(transaction.invoiceId)
    billRun = await BillRunModel.query().findById(transaction.billRunId)

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe.only('When a valid licence is supplied', () => {
    it('deletes the licence', async () => {
      await DeleteLicenceService.go(licence, billRun, notifierFake)

      const result = await LicenceModel.query().findById(transaction.licenceId)

      expect(result).to.not.exist()
    })

    it('deletes the licence transactions', async () => {
      await DeleteLicenceService.go(licence, billRun, notifierFake)

      const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })

      expect(transactions).to.be.empty()
    })

    it('sets the bill run status to `pending` during deletion', async () => {
      const spy = Sinon.spy(BillRunModel, 'query')

      await DeleteLicenceService.go(licence, billRun, notifierFake)

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

    describe('when there are licences left', () => {
      it('updates the invoice level figures', async () => {
        // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await NewLicenceHelper.create(invoice, { licenceNumber: 'SECOND_LICENCE' })

        // Generate the bill run to ensure its values are updated before we delete the licence
        await GenerateBillRunService.go(billRun)

        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await InvoiceModel.query().findById(transaction.invoiceId)
        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
      })

      describe('sets zeroValueInvoice', () => {
        let secondTransaction
        let secondLicence

        beforeEach(async () => {
          // Add a credit to the original invoice to cancel out its original debit and make it zero value
          await NewTransactionHelper.create(licence, { chargeCredit: true })

          // Create a second invoice with a transaction
          const secondInvoice = await NewInvoiceHelper.create(billRun)
          secondLicence = await NewLicenceHelper.create(secondInvoice)
          secondTransaction = await NewTransactionHelper.create(secondLicence, { customerReference: 'CUST2' })

          // Generate the bill run to ensure its values are updated before we delete the licence
          await GenerateBillRunService.go(billRun)
        })

        it('to `true` when still applicable', async () => {
          await DeleteLicenceService.go(secondLicence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(transaction.invoiceId)
          expect(result.zeroValueInvoice).to.be.true()
        })

        it('to `false` when not applicable', async () => {
          await DeleteLicenceService.go(licence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(secondTransaction.invoiceId)
          expect(result.zeroValueInvoice).to.be.false()
        })
      })

      describe('sets deminimisInvoice', () => {
        let secondTransaction
        let secondLicence

        beforeEach(async () => {
          // Create a second, non-deminimis invoice
          const secondInvoice = await NewInvoiceHelper.create(billRun)
          secondLicence = await NewLicenceHelper.create(secondInvoice)
          secondTransaction = await NewTransactionHelper.create(secondLicence)

          // Add a credit to the original invoice to make it deminimis
          await NewTransactionHelper.create(licence, { chargeCredit: true, chargeValue: 771 })

          // Generate the bill run to ensure its values are updated before we delete the licence
          await GenerateBillRunService.go(billRun)
        })

        it('to `true` when still applicable', async () => {
          await DeleteLicenceService.go(secondLicence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(transaction.invoiceId)
          expect(result.deminimisInvoice).to.be.true()
        })

        it('to `false` when not applicable', async () => {
          await DeleteLicenceService.go(licence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(secondTransaction.invoiceId)
          expect(result.deminimisInvoice).to.be.false()
        })
      })

      describe('sets minimumChargeInvoice', () => {
        let minimumChargeLicence

        beforeEach(async () => {
          // Create a second minimum charge licence
          const minimumChargeInvoice = await NewInvoiceHelper.create(billRun)
          minimumChargeLicence = await NewLicenceHelper.create(minimumChargeInvoice)
          await NewTransactionHelper.create(minimumChargeLicence, { subjectToMinimumCharge: true, chargeValue: 1 })

          // Generate the bill run to ensure its values are updated before we delete the licence
          await GenerateBillRunService.go(billRun)
        })

        it('to `true` when still applicable', async () => {
          await DeleteLicenceService.go(licence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(minimumChargeLicence.invoiceId)
          expect(result.minimumChargeInvoice).to.be.true()
        })

        it('to `false` when not applicable', async () => {
          await DeleteLicenceService.go(minimumChargeLicence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(licence.invoiceId)
          expect(result.minimumChargeInvoice).to.be.false()
        })
      })

      describe('when an invoice contains two minimum charge licences', () => {
        let fixBillRun
        let fixInvoice
        let lessThanMinLicence
        let moreThanMinLicence

        beforeEach(async () => {
          fixInvoice = await NewInvoiceHelper.create()
          fixBillRun = await BillRunModel.query().findById(fixInvoice.billRunId)

          // Create a £24 minimum charge licence
          lessThanMinLicence = await NewLicenceHelper.create(fixInvoice, { licenceNumber: 'LESS01' })
          await NewTransactionHelper.create(lessThanMinLicence, { subjectToMinimumCharge: true, chargeValue: 2400 })

          // Create a £26 minimum charge licence
          moreThanMinLicence = await NewLicenceHelper.create(fixInvoice, { licenceNumber: 'MORE01' })
          await NewTransactionHelper.create(moreThanMinLicence, { subjectToMinimumCharge: true, chargeValue: 2600 })
        })

        describe('one of which is for less than £25 and the other for more than £25', () => {
          describe('if the one less than £25 is deleted', () => {
            describe("from an 'initialised' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                await DeleteLicenceService.go(lessThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })

            describe("from a 'generated' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                await GenerateBillRunService.go(fixBillRun)
                await DeleteLicenceService.go(lessThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })
          })

          describe('if the one more than £25 is deleted', () => {
            describe("from an 'initialised' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                await DeleteLicenceService.go(moreThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })

            describe("from a 'generated' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (true)', async () => {
                await GenerateBillRunService.go(fixBillRun)
                await DeleteLicenceService.go(moreThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.true()
              })
            })
          })
        })
      })

      describe('when an invoice contains a licence with zero value', () => {
        let zeroValueLicence

        beforeEach(async () => {
          // Create a licence with zero value
          zeroValueLicence = await NewLicenceHelper.create(invoice, { licenceNumber: 'ZERO01' })
          await NewTransactionHelper.create(zeroValueLicence, { chargeValue: 0 })
        })

        describe.only('and a licence with a debit value is deleted', () => {
          it('correctly updates the bill run level figures', async () => {
            await GenerateBillRunService.go(billRun)

            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(zeroValueLicence.billRunId)
            expect(result.zeroLineCount).to.equal(1)
            expect(result.invoiceCount).to.equal(0)
            expect(result.invoiceValue).to.equal(0)
            expect(result.netTotal).to.equal(0)
          })
        })

        describe('and a licence with a credit value is deleted', () => {
          beforeEach(async () => {
            // Patch the existing transaction to be a credit
            transaction.$query().patch({ chargeCredit: true })
          })

          it('correctly updates the bill run level figures', async () => {
            await GenerateBillRunService.go(billRun)

            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(zeroValueLicence.billRunId)
            expect(result.zeroLineCount).to.equal(1)
            expect(result.creditNoteCount).to.equal(0)
            expect(result.creditNoteValue).to.equal(0)
            expect(result.netTotal).to.equal(0)
          })
        })
      })

      it('updates the bill run level figures', async () => {
        // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await NewLicenceHelper.create(invoice, { licenceNumber: 'SECOND_LICENCE' })

        await GenerateBillRunService.go(billRun)

        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await BillRunModel.query().findById(transaction.billRunId)
        expect(result.invoiceValue).to.equal(0)
        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
      })

      it('restores the bill run status after deletion', async () => {
        // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await NewLicenceHelper.create(invoice, { licenceNumber: 'SECOND_LICENCE' })

        await GenerateBillRunService.go(billRun)

        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('generated')
      })
    })

    describe('when there are no licences left', () => {
      it('deletes the invoice', async () => {
        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await InvoiceModel.query().findById(transaction.invoiceId)
        expect(result).to.be.undefined()
      })

      it('updates the bill run level figures', async () => {
        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await BillRunModel.query().findById(transaction.billRunId)
        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
      })

      it('sets the bill run status to `initialised`', async () => {
        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('initialised')
      })
    })
  })

  describe('When an error occurs', () => {
    it('calls the notifier', async () => {
      const invalidParamater = GeneralHelper.uuid4()
      await DeleteLicenceService.go(invalidParamater, billRun, notifierFake)

      expect(notifierFake.omfg.callCount).to.equal(1)
      expect(notifierFake.omfg.firstArg).to.equal('Error deleting licence')
    })
  })
})
