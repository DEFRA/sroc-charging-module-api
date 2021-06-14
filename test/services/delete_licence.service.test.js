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

  describe('When a valid licence is supplied', () => {
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
