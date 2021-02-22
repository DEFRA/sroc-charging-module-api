'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { AuthorisedSystemHelper, BillRunHelper, DatabaseHelper, GeneralHelper, InvoiceHelper, RegimeHelper } = require('../support/helpers')
const { InvoiceModel } = require('../../app/models')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { DeleteInvoiceService } = require('../../app/services')

describe.only('Delete Invoice service', () => {
  let billRun
  let authorisedSystem
  let regime
  let payload
  let rulesServiceStub
  let loggerFake

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    rulesServiceStub = Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid invoice is supplied', () => {
    it('deletes the invoice', async () => {
      const invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER_REF', 2021, 0, 0, 1, 5000)

      await DeleteInvoiceService.go(invoice.id)

      const result = await InvoiceModel.query().findById(invoice.id)

      expect(result).to.not.exist()
    })
  })

  describe('When there is no matching invoice', () => {
    it('throws an error', async () => {
      const unknownInvoiceId = GeneralHelper.uuid4()
      const err = await expect(DeleteInvoiceService.go(unknownInvoiceId)).to.reject()

      expect(err).to.be.an.error()
      expect(err.output.payload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
    })
  })
})
