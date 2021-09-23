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
  LicenceHelper,
  RegimeHelper,
  RulesServiceHelper
} = require('../../support/helpers')

const {
  BillRunModel,
  InvoiceModel,
  LicenceModel,
  TransactionModel
} = require('../../../app/models')

const { CreateTransactionService, GenerateBillRunService } = require('../../../app/services')

const { presroc: requestFixtures } = require('../../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RequestRulesServiceCharge } = require('../../../app/services')

// Thing under test
const { DeleteLicenceService } = require('../../../app/services')

describe.only('Delete Licence service', () => {
  let regime
  let authorisedSystem
  let billRun
  let transaction
  let notifierFake
  let rulesServiceStub
  let payload
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

    rulesServiceStub = Sinon.stub(RequestRulesServiceCharge, 'go').returns(rulesServiceResponse)

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)

    // We use CreateTransactionService to create our transaction as this updates the stats correctly
    rulesServiceStub.restore()
    RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 5000)
    const { transaction: transactionResult } = await CreateTransactionService.go(
      payload, billRun, authorisedSystem, regime
    )
    transaction = await TransactionModel.query().findById(transactionResult.id)
    licence = await LicenceModel.query().findById(transaction.licenceId)

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

    describe('when there are licences left', () => {
      it('updates the invoice level figures', async () => {
        // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await LicenceHelper.addLicence(billRun.id, 'SECOND_LICENCE', transaction.invoiceId, 'TH230000222', 2019)
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
        // Add a transaction to a second invoice
          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 5000)
          const { transaction: secondTransactionResult } = await CreateTransactionService.go(
            { ...payload, customerReference: 'CUST2' }, billRun, authorisedSystem, regime
          )
          secondTransaction = await TransactionModel.query().findById(secondTransactionResult.id)
          secondLicence = await LicenceModel.query().findById(secondTransaction.licenceId)

          // Add a credit to the original invoice to cancel out its original debit
          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 5000)
          await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)

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
        // Add a transaction to a second invoice
          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 5000)
          const { transaction: secondTransactionResult } = await CreateTransactionService.go(
            { ...payload, customerReference: 'CUST2' }, billRun, authorisedSystem, regime
          )
          secondTransaction = await TransactionModel.query().findById(secondTransactionResult.id)
          secondLicence = await LicenceModel.query().findById(secondTransaction.licenceId)

          // Add a credit to the original invoice to take its value below the deminimis limit
          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 4750)
          await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)

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
        // Add a minimum charge transaction to a second invoice
          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 5)
          const { transaction: secondTransactionResult } = await CreateTransactionService.go(
            { ...payload, customerReference: 'CUST2', subjectToMinimumCharge: true }, billRun, authorisedSystem, regime
          )
          const minimumChargeTransaction = await TransactionModel.query().findById(secondTransactionResult.id)
          minimumChargeLicence = await LicenceModel.query().findById(minimumChargeTransaction.licenceId)

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
        let lessThanMinLicence
        let moreThanMinLicence

        beforeEach(async () => {
          fixBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 2400)
          const { transaction: lessThanMinResponse } = await CreateTransactionService.go(
            { ...payload, subjectToMinimumCharge: true, licenceNumber: 'LESS01' }, fixBillRun, authorisedSystem, regime
          )
          const lessThanMinTransaction = await TransactionModel.query().findById(lessThanMinResponse.id)
          lessThanMinLicence = await LicenceModel.query().findById(lessThanMinTransaction.licenceId)

          rulesServiceStub.restore()
          RulesServiceHelper.mockValue(Sinon, RequestRulesServiceCharge, rulesServiceResponse, 2600)
          const { transaction: moreThanMinResponse } = await CreateTransactionService.go(
            { ...payload, subjectToMinimumCharge: true, licenceNumber: 'MORE01' }, fixBillRun, authorisedSystem, regime
          )
          const moreThanMinTransaction = await TransactionModel.query().findById(moreThanMinResponse.id)
          moreThanMinLicence = await LicenceModel.query().findById(moreThanMinTransaction.licenceId)
        })

        describe('one of which is for less than £25 and the other for more than £25', () => {
          describe('if the one less than £25 is deleted', () => {
            describe("from an 'intialised' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                await DeleteLicenceService.go(lessThanMinLicence, billRun, notifierFake)

                const result = await InvoiceModel.query().findById(lessThanMinLicence.invoiceId)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })

            describe("from a 'generated' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                await GenerateBillRunService.go(fixBillRun)
                await DeleteLicenceService.go(lessThanMinLicence, billRun, notifierFake)

                const result = await InvoiceModel.query().findById(lessThanMinLicence.invoiceId)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })
          })

          describe('if the one more than £25 is deleted', () => {
            describe("from an 'intialised' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (false)', async () => {
                await DeleteLicenceService.go(moreThanMinLicence, billRun, notifierFake)

                const result = await InvoiceModel.query().findById(moreThanMinLicence.invoiceId)
                expect(result.minimumChargeInvoice).to.be.false()
              })
            })

            describe("from an 'generated' bill run", () => {
              it('sets the `minimumChargeInvoice` flag correctly (true)', async () => {
                await GenerateBillRunService.go(fixBillRun)
                await DeleteLicenceService.go(moreThanMinLicence, billRun, notifierFake)

                const result = await InvoiceModel.query().findById(moreThanMinLicence.invoiceId)
                expect(result.minimumChargeInvoice).to.be.true()
              })
            })
          })
        })
      })

      it('updates the bill run level figures', async () => {
      // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await LicenceHelper.addLicence(billRun.id, 'SECOND_LICENCE', transaction.invoiceId, 'TH230000222', 2019)

        await GenerateBillRunService.go(billRun)

        await DeleteLicenceService.go(licence, billRun, notifierFake)

        const result = await BillRunModel.query().findById(transaction.billRunId)
        expect(result.invoiceValue).to.equal(0)
        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
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
