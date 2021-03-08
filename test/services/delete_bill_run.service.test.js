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
  RegimeHelper,
  RulesServiceHelper
} = require('../support/helpers')

const {
  BillRunModel,
  InvoiceModel,
  LicenceModel,
  TransactionModel
} = require('../../app/models')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

const { CreateTransactionService, GenerateBillRunService } = require('../../app/services')

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { DeleteBillRunService } = require('../../app/services')

describe('Delete Invoice service', () => {
  let billRun
  let authorisedSystem
  let regime
  let payload
  let invoice

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)

    Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe.only('When a valid bill run is supplied', () => {
    beforeEach(async () => {
      await CreateTransactionService.go(payload, billRun, authorisedSystem, regime)
      invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
    })

    it.only('deletes the bill run', async () => {
      await DeleteBillRunService.go(billRun.id)

      const result = await BillRunModel.query().findById(billRun.id)

      expect(result).to.not.exist()
    })

    it('deletes the bill run invoices', async () => {

    })

    it('deletes the bill run licences', async () => {
      // const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

      // await DeleteInvoiceService.go(invoice.id, billRun.id)

      // const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
      // expect(licences).to.be.empty()
    })

    it('deletes the bill run transactions', async () => {
      // const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

      // await DeleteInvoiceService.go(invoice.id, billRun.id)

      // const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
      // expect(transactions).to.be.empty()
    })
  })

  // describe('When an invalid bill run is supplied', () => {
  //   describe('because there is no matching bill run', () => {
  //     it('throws an error', async () => {
  //       const unknownInvoiceId = GeneralHelper.uuid4()
  //       const unknownBillRunId = GeneralHelper.uuid4()
  //       const err = await expect(DeleteInvoiceService.go(unknownInvoiceId, unknownBillRunId)).to.reject()

  //       expect(err).to.be.an.error()
  //       expect(err.output.payload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
  //     })
  //   })
  // })
})
