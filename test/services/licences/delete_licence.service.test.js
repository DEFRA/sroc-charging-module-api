'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper')
const GeneralHelper = require('../../support/helpers/general.helper')
const NewLicenceHelper = require('../../support/helpers/new_licence.helper')
const NewBillRunHelper = require('../../support/helpers/new_bill_run.helper')
const NewInvoiceHelper = require('../../support/helpers/new_invoice.helper')
const NewTransactionHelper = require('../../support/helpers/new_transaction.helper')

const BillRunModel = require('../../../app/models/bill_run.model')
const InvoiceModel = require('../../../app/models/invoice.model')
const LicenceModel = require('../../../app/models/licence.model')
const RegimeModel = require('../../../app/models/regime.model')
const TransactionModel = require('../../../app/models/transaction.model')

const GenerateBillRunService = require('../../../app/services/bill_runs/generate_bill_run.service')

// Thing under test
const DeleteLicenceService = require('../../../app/services/licences/delete_licence.service')

describe('Delete Licence service', () => {
  let billRun
  let srocInvoice
  let licence
  let transaction
  let notifierFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    transaction = await NewTransactionHelper.create()
    licence = await LicenceModel.query().findById(transaction.licenceId)
    srocInvoice = await InvoiceModel.query().findById(transaction.invoiceId)
    billRun = await BillRunModel.query().findById(transaction.billRunId)

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid licence is supplied', () => {
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
        await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'SECOND_LICENCE' })

        // Generate the bill run to ensure its values are updated before we delete the licence
        await GenerateBillRunService.go(billRun)

        // Refresh bill run
        billRun = await billRun.$query()

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

          // Refresh bill run
          billRun = await billRun.$query()
        })

        it('to `true` when still applicable', async () => {
          // Refresh licence entity
          secondLicence = await secondLicence.$query()

          await DeleteLicenceService.go(secondLicence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(transaction.invoiceId)
          expect(result.zeroValueInvoice).to.be.true()
        })

        it('to `false` when not applicable', async () => {
          // Refresh licence entity
          licence = await licence.$query()

          await DeleteLicenceService.go(licence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(secondTransaction.invoiceId)
          expect(result.zeroValueInvoice).to.be.false()
        })
      })

      describe('sets deminimisInvoice', () => {
        describe('when the ruleset is `presroc`', () => {
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

            // Refresh bill run
            billRun = await billRun.$query()
          })

          it('to `true` when still applicable', async () => {
            // Refresh licence entity
            secondLicence = await secondLicence.$query()

            await DeleteLicenceService.go(secondLicence, billRun, notifierFake)

            const result = await InvoiceModel.query().findById(transaction.invoiceId)
            expect(result.deminimisInvoice).to.be.true()
          })

          it('to `false` when not applicable', async () => {
            // Refresh licence entity
            licence = await licence.$query()

            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await InvoiceModel.query().findById(secondTransaction.invoiceId)
            expect(result.deminimisInvoice).to.be.false()
          })
        })

        describe('when the ruleset is `sroc`', () => {
          let srocBillRun
          let srocInvoice

          beforeEach(async () => {
            // Create an sroc bill run and an invoice
            srocBillRun = await NewBillRunHelper.create(null, null, { ruleset: 'sroc' })
            srocInvoice = await NewInvoiceHelper.create(srocBillRun)

            // Create two licences, one with a large value, one with a value of a penny
            const licence = await NewLicenceHelper.create(srocInvoice)
            await NewTransactionHelper.create(licence, { chargeValue: 1100 })
            const pennyLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'PENNY_LICENCE' })
            await NewTransactionHelper.create(pennyLicence, { chargeValue: 1 })

            // Generate the bill run to ensure its values are updated before we delete the licence
            await GenerateBillRunService.go(billRun)

            // Refresh bill run and licence entities
            billRun = await billRun.$query()
            await licence.$query()
            await pennyLicence.$query()
          })

          it('to `false` always, as deminimis does not apply to sroc', async () => {
            // Delete the first licence to bring the invoice value down to a penny
            await DeleteLicenceService.go(licence, srocBillRun, notifierFake)

            const result = await srocInvoice.$query()
            expect(result.deminimisInvoice).to.be.false()
          })
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

          // Refresh bill run
          billRun = await billRun.$query()
        })

        it('to `true` when still applicable', async () => {
          // Refresh licence entity
          licence = await licence.$query()

          await DeleteLicenceService.go(licence, billRun, notifierFake)

          const result = await InvoiceModel.query().findById(minimumChargeLicence.invoiceId)
          expect(result.minimumChargeInvoice).to.be.true()
        })

        it('to `false` when not applicable', async () => {
          // Refresh licence entity
          minimumChargeLicence = await minimumChargeLicence.$query()

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
                // Refresh licence entity
                lessThanMinLicence = await lessThanMinLicence.$query()

                await DeleteLicenceService.go(lessThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })

            describe("from a 'generated' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                await GenerateBillRunService.go(fixBillRun)

                // Refresh entities
                fixBillRun = await fixBillRun.$query()
                lessThanMinLicence = await lessThanMinLicence.$query()

                await DeleteLicenceService.go(lessThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })
          })

          describe('if the one more than £25 is deleted', () => {
            describe("from an 'initialised' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                // Refresh licence entity
                moreThanMinLicence = await moreThanMinLicence.$query()

                await DeleteLicenceService.go(moreThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })

            describe("from a 'generated' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (true)', async () => {
                await GenerateBillRunService.go(fixBillRun)

                // Refresh entities
                fixBillRun = await fixBillRun.$query()
                moreThanMinLicence = await moreThanMinLicence.$query()

                await DeleteLicenceService.go(moreThanMinLicence, fixBillRun, notifierFake)

                const result = await InvoiceModel.query().findById(fixInvoice.id)
                expect(result.minimumChargeInvoice).to.be.true()
              })
            })
          })
        })
      })

      describe('when an invoice is overall in debit', () => {
        describe('and it remains a debit after deleting licence', () => {
          let creditLicence

          beforeEach(async () => {
            // Create a credit licence small enough to leave the invoice as a debit
            creditLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'CREDIT' })
            await NewTransactionHelper.create(creditLicence, { chargeValue: 50, chargeCredit: true })

            await GenerateBillRunService.go(billRun)

            // Refresh bill run
            billRun = await billRun.$query()
          })

          it('correctly updates the bill run level figures', async () => {
            // Refresh licence entity
            creditLicence = await creditLicence.$query()

            // Delete the credit licence to leave the invoice a debit
            await DeleteLicenceService.go(creditLicence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)

            expect(result.invoiceCount).to.equal(1)
            expect(result.invoiceValue).to.equal(772)
            expect(result.creditNoteCount).to.be.equal(0)
            expect(result.creditNoteValue).to.equal(0)
          })
        })

        describe('and it becomes a credit after deleting licence', () => {
          beforeEach(async () => {
            // Create a credit licence small enough to leave the invoice as a debit
            const creditLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'CREDIT' })
            await NewTransactionHelper.create(creditLicence, { chargeValue: 50, chargeCredit: true })

            await GenerateBillRunService.go(billRun)

            // Refresh bill run
            billRun = await billRun.$query()
          })

          it('correctly updates the bill run level figures', async () => {
            // Delete the debit licence to make the invoice a credit
            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)
            expect(result.creditNoteCount).to.be.equal(1)
            expect(result.creditNoteValue).to.equal(50)
            expect(result.invoiceCount).to.equal(0)
            expect(result.invoiceValue).to.equal(0)
          })
        })

        describe('and it becomes zero value after deleting licence', () => {
          beforeEach(async () => {
            // Create a zero value licence
            const zeroValueLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'ZERO' })
            await NewTransactionHelper.create(zeroValueLicence, { chargeValue: 0, chargeCredit: true })

            await GenerateBillRunService.go(billRun)

            // Refresh bill run
            billRun = await billRun.$query()
          })

          it('correctly updates the bill run level figures', async () => {
            // Delete the debit licence to make the invoice a credit
            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)
            expect(result.zeroLineCount).to.equal(1)
            expect(result.invoiceCount).to.equal(0)
            expect(result.invoiceValue).to.equal(0)
          })
        })
      })

      describe('when an invoice is overall in credit', () => {
        describe('and it remains a credit after deleting licence', () => {
          beforeEach(async () => {
            // Create a credit licence big enough to make the invoice a credit
            const creditLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'CREDIT' })
            await NewTransactionHelper.create(creditLicence, { chargeValue: 50000, chargeCredit: true })

            await GenerateBillRunService.go(billRun)

            // Refresh bill run
            billRun = await billRun.$query()
          })

          it('correctly updates the bill run level figures', async () => {
            // Delete the debit licence to leave the invoice a credit
            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)
            expect(result.creditNoteCount).to.be.equal(1)
            expect(result.creditNoteValue).to.equal(50000)
            expect(result.invoiceCount).to.equal(0)
            expect(result.invoiceValue).to.equal(0)
          })
        })

        describe('and it becomes a debit after deleting licence', () => {
          let creditLicence

          beforeEach(async () => {
            // Create a credit licence big enough to make the invoice a credit
            creditLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'CREDIT' })
            await NewTransactionHelper.create(creditLicence, { chargeValue: 50000, chargeCredit: true })

            await GenerateBillRunService.go(billRun)

            // Refresh bill run
            billRun = await billRun.$query()
          })

          it('correctly updates the bill run level figures', async () => {
            creditLicence = await creditLicence.$query()

            // Delete the credit licence to make the invoice a debit
            await DeleteLicenceService.go(creditLicence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)
            expect(result.invoiceCount).to.equal(1)
            expect(result.invoiceValue).to.equal(772)
            expect(result.creditNoteCount).to.equal(0)
            expect(result.creditNoteValue).to.equal(0)
          })
        })

        describe('and it becomes zero value after deleting licence', () => {
          let fixBillRun
          let creditLicence

          beforeEach(async () => {
            // Create a fresh bill run with credit and zero value licences on it
            const regime = await RegimeModel.query().findById(billRun.regimeId)
            const authorisedSystem = await regime.$relatedQuery('authorisedSystems').first()
            fixBillRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id)

            const fixInvoice = await NewInvoiceHelper.create(fixBillRun)

            const zeroValueLicence = await NewLicenceHelper.create(fixInvoice, { licenceNumber: 'ZERO' })
            await NewTransactionHelper.create(zeroValueLicence, { chargeValue: 0 })

            creditLicence = await NewLicenceHelper.create(fixInvoice, { licenceNumber: 'CREDIT' })
            await NewTransactionHelper.create(creditLicence, { chargeCredit: true })

            await GenerateBillRunService.go(fixBillRun)

            // Refresh bill run
            fixBillRun = await fixBillRun.$query()
          })

          it('correctly updates the bill run level figures', async () => {
            // Refresh licence entity
            creditLicence = await creditLicence.$query()

            // Delete the credit licence to make the invoice zero value
            await DeleteLicenceService.go(creditLicence, fixBillRun, notifierFake)

            const result = await fixBillRun.$query()
            expect(result.zeroLineCount).to.equal(1)
            expect(result.creditNoteCount).to.equal(0)
            expect(result.creditNoteValue).to.equal(0)
          })
        })
      })

      describe('when an invoice is subject to deminimis', () => {
        let creditLicence

        beforeEach(async () => {
          creditLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'CREDIT' })
          await NewTransactionHelper.create(creditLicence, { chargeValue: 770, chargeCredit: true })

          await GenerateBillRunService.go(billRun)

          // Refresh bill run
          billRun = await billRun.$query()
        })

        describe('and the credit is deleted to leave it in debit', () => {
          it('correctly updates the bill run level figures', async () => {
            // Refresh licence entity
            creditLicence = await creditLicence.$query()

            // Delete the credit licence
            await DeleteLicenceService.go(creditLicence, billRun, notifierFake)

            const result = await billRun.$query()
            expect(result.invoiceCount).to.equal(1)
            expect(result.invoiceValue).to.equal(772)
          })
        })

        describe('and the debit is deleted to leave it in credit', () => {
          it('correctly updates the bill run level figures', async () => {
            // Delete the debit licence
            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await billRun.$query()
            expect(result.creditNoteCount).to.equal(1)
            expect(result.creditNoteValue).to.equal(770)
          })
        })
      })

      describe('when an invoice becomes subject to deminimis', () => {
        let creditLicence
        let debitLicence

        beforeEach(async () => {
          // Create credit and debits which will make the invoice deminimis once the original licence is deleted
          creditLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'CREDIT' })
          await NewTransactionHelper.create(creditLicence, { chargeValue: 770, chargeCredit: true })

          debitLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'DEBIT' })
          await NewTransactionHelper.create(debitLicence)

          await GenerateBillRunService.go(billRun)

          // Refresh bill run
          billRun = await billRun.$query()
        })

        it('correctly updates the bill run level figures', async () => {
          // Delete the debit licence
          await DeleteLicenceService.go(licence, billRun, notifierFake)

          const result = await billRun.$query()
          expect(result.invoiceCount).to.equal(0)
          expect(result.invoiceValue).to.equal(0)
          expect(result.creditNoteCount).to.equal(0)
          expect(result.creditNoteValue).to.equal(0)
        })
      })

      describe('when an invoice is overall zero value', () => {
        let creditLicence
        let zeroValueLicence

        beforeEach(async () => {
          // Create a credit licence
          creditLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'CREDIT' })
          await NewTransactionHelper.create(creditLicence, { chargeCredit: true })

          // Create a zero value licence
          zeroValueLicence = await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'ZERO' })
          await NewTransactionHelper.create(zeroValueLicence, { chargeValue: 0 })

          // Generate the bill run and refresh its instance
          await GenerateBillRunService.go(billRun)
          billRun = await billRun.$query()
        })

        describe('and it remains zero value after deleting licence', () => {
          it('correctly updates the bill run level figures', async () => {
            // Refresh licence entity
            zeroValueLicence = await zeroValueLicence.$query()

            // Delete the zero value licence to leave the invoice overall zero value
            await DeleteLicenceService.go(zeroValueLicence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)

            expect(result.invoiceCount).to.equal(0)
            expect(result.invoiceValue).to.equal(0)
            expect(result.creditNoteCount).to.be.equal(0)
            expect(result.creditNoteValue).to.equal(0)
          })
        })

        describe('and it becomes a credit after deleting licence', () => {
          it('correctly updates the bill run level figures', async () => {
            // Refresh licence entity
            licence = await licence.$query()

            // Delete the debit licence to make the invoice a credit
            await DeleteLicenceService.go(licence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)
            expect(result.creditNoteCount).to.be.equal(1)
            expect(result.creditNoteValue).to.equal(772)
            expect(result.invoiceCount).to.equal(0)
            expect(result.invoiceValue).to.equal(0)
            expect(result.zeroLineCount).to.equal(1)
          })
        })

        describe('and it becomes a debit after deleting licence', () => {
          it('correctly updates the bill run level figures', async () => {
            // Refresh licence entity
            creditLicence = await creditLicence.$query()

            // Delete the credit licence to make the invoice a credit
            await DeleteLicenceService.go(creditLicence, billRun, notifierFake)

            const result = await BillRunModel.query().findById(transaction.billRunId)
            expect(result.invoiceCount).to.equal(1)
            expect(result.invoiceValue).to.equal(772)
            expect(result.creditNoteCount).to.be.equal(0)
            expect(result.creditNoteValue).to.equal(0)
            expect(result.zeroLineCount).to.equal(1)
          })
        })
      })

      it('updates the bill run level figures', async () => {
        // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'SECOND_LICENCE' })

        await GenerateBillRunService.go(billRun)

        // Refresh bill run
        billRun = await billRun.$query()

        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await BillRunModel.query().findById(transaction.billRunId)
        expect(result.invoiceValue).to.equal(0)
        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
      })

      it('restores the bill run status after deletion', async () => {
        // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await NewLicenceHelper.create(srocInvoice, { licenceNumber: 'SECOND_LICENCE' })

        await GenerateBillRunService.go(billRun)

        // Refresh bill run
        billRun = await billRun.$query()

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

      describe('and there are other invoices on the bill run', () => {
        beforeEach(async () => {
          // Create a second invoice
          const secondInvoice = await NewInvoiceHelper.create(billRun)
          const secondLicence = await NewLicenceHelper.create(secondInvoice, { licenceNumber: 'SECOND' })
          await NewTransactionHelper.create(secondLicence)

          // Generate and refresh the bill run
          await GenerateBillRunService.go(billRun)
          billRun = await billRun.$query()
        })

        it('updates the bill run level figures', async () => {
          await DeleteLicenceService.go(licence, billRun, notifierFake)

          const result = await BillRunModel.query().findById(transaction.billRunId)
          expect(result.invoiceCount).to.equal(1)
          expect(result.invoiceValue).to.equal(772)
        })
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
