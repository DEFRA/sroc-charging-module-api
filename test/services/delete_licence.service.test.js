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
} = require('../support/helpers')

const {
  BillRunModel,
  InvoiceModel,
  LicenceModel,
  TransactionModel
} = require('../../app/models')

const { CreateTransactionService, GenerateBillRunService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { DeleteLicenceService } = require('../../app/services')

describe('Delete Licence service', () => {
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

    rulesServiceStub = Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)

    // We use CreateTransactionService to create our transaction as this updates the stats correctly
    rulesServiceStub.restore()
    RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5000)
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

  describe.only('When a valid licence is supplied', () => {
    it('deletes the licence', async () => {
      await DeleteLicenceService.go(licence, notifierFake)

      const result = await LicenceModel.query().findById(transaction.licenceId)

      expect(result).to.not.exist()
    })

    it('deletes the licence transactions', async () => {
      await DeleteLicenceService.go(licence, notifierFake)

      const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })

      expect(transactions).to.be.empty()
    })

    it('updates the invoice level figures', async () => {
      // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
      await LicenceHelper.addLicence(billRun.id, 'SECOND_LICENCE', transaction.invoiceId, 'TH230000222', 2019)
      // Generate the bill run to ensure its values are updated before we delete the licence
      await GenerateBillRunService.go(billRun)

      await DeleteLicenceService.go(licence, notifierFake)

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
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5000)
        const { transaction: secondTransactionResult } = await CreateTransactionService.go(
          { ...payload, customerReference: 'CUST2' }, billRun, authorisedSystem, regime
        )
        secondTransaction = await TransactionModel.query().findById(secondTransactionResult.id)
        secondLicence = await LicenceModel.query().findById(secondTransaction.licenceId)

        // Add a credit to the original invoice to cancel out its original debit
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5000)
        await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)

        // Generate the bill run to ensure its values are updated before we delete the licence
        await GenerateBillRunService.go(billRun)
      })

      it('to `true` when still applicable', async () => {
        await DeleteLicenceService.go(secondLicence, notifierFake)

        const result = await InvoiceModel.query().findById(transaction.invoiceId)
        expect(result.zeroValueInvoice).to.be.true()
      })

      it('to `false` when not applicable', async () => {
        await DeleteLicenceService.go(licence, notifierFake)

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
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5000)
        const { transaction: secondTransactionResult } = await CreateTransactionService.go(
          { ...payload, customerReference: 'CUST2' }, billRun, authorisedSystem, regime
        )
        secondTransaction = await TransactionModel.query().findById(secondTransactionResult.id)
        secondLicence = await LicenceModel.query().findById(secondTransaction.licenceId)

        // Add a credit to the original invoice to take its value below the deminimis limit
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 4750)
        await CreateTransactionService.go({ ...payload, credit: true }, billRun, authorisedSystem, regime)

        // Generate the bill run to ensure its values are updated before we delete the licence
        await GenerateBillRunService.go(billRun)
      })

      it('to `true` when still applicable', async () => {
        await DeleteLicenceService.go(secondLicence, notifierFake)

        const result = await InvoiceModel.query().findById(transaction.invoiceId)
        expect(result.deminimisInvoice).to.be.true()
      })

      it('to `false` when not applicable', async () => {
        await DeleteLicenceService.go(licence, notifierFake)

        const result = await InvoiceModel.query().findById(secondTransaction.invoiceId)
        expect(result.deminimisInvoice).to.be.false()
      })
    })

    describe('sets minimumChargeInvoice', () => {
      let minimumChargeLicence

      beforeEach(async () => {
        // Add a minimum charge transaction to a second invoice
        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 5)
        const { transaction: secondTransactionResult } = await CreateTransactionService.go(
          { ...payload, customerReference: 'CUST2', subjectToMinimumCharge: true }, billRun, authorisedSystem, regime
        )
        const minimumChargeTransaction = await TransactionModel.query().findById(secondTransactionResult.id)
        minimumChargeLicence = await LicenceModel.query().findById(minimumChargeTransaction.licenceId)

        // Generate the bill run to ensure its values are updated before we delete the licence
        await GenerateBillRunService.go(billRun)
      })

      it('to `true` when still applicable', async () => {
        await DeleteLicenceService.go(licence, notifierFake)

        const result = await InvoiceModel.query().findById(minimumChargeLicence.invoiceId)
        expect(result.minimumChargeInvoice).to.be.true()
      })

      it('to `false` when not applicable', async () => {
        await DeleteLicenceService.go(minimumChargeLicence, notifierFake)

        const result = await InvoiceModel.query().findById(licence.invoiceId)
        expect(result.minimumChargeInvoice).to.be.false()
      })
    })

    describe('at the bill run level', () => {
      it('updates the figures', async () => {
        // Create a second licence on the invoice to ensure the invoice isn't deleted due to it being empty
        await LicenceHelper.addLicence(billRun.id, 'SECOND_LICENCE', transaction.invoiceId, 'TH230000222', 2019)

        await GenerateBillRunService.go(billRun)

        await DeleteLicenceService.go(licence, notifierFake)

        const result = await BillRunModel.query().findById(transaction.billRunId)
        expect(result.invoiceValue).to.equal(0)
        expect(result.debitLineCount).to.equal(0)
        expect(result.debitLineValue).to.equal(0)
      })
    })

    it('deletes the invoice if there are no licences left', async () => {
      await DeleteLicenceService.go(licence, notifierFake)

      const result = await InvoiceModel.query().findById(transaction.invoiceId)
      expect(result).to.be.undefined()
    })
  })

  describe('When an error occurs', () => {
    it('calls the notifier', async () => {
      const invalidParamater = GeneralHelper.uuid4()
      await DeleteLicenceService.go(invalidParamater, notifierFake)

      expect(notifierFake.omfg.callCount).to.equal(1)
      expect(notifierFake.omfg.firstArg).to.equal('Error deleting licence')
    })
  })
})
