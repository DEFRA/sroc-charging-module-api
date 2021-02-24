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
  RegimeHelper
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
const { DeleteInvoiceService } = require('../../app/services')

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
    await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)
    invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid invoice is supplied', () => {
    it('deletes the invoice', async () => {
      await DeleteInvoiceService.go(invoice.id)

      const result = await InvoiceModel.query().findById(invoice.id)

      expect(result).to.not.exist()
    })

    it('updates the billrun values', async () => {
      // We generate the bill run to ensure that the invoice-level figures are updated
      await GenerateBillRunService.go(billRun)

      await DeleteInvoiceService.go(invoice.id)

      const result = await BillRunModel.query().findById(billRun.id)
      const values = billRunValues(result)

      // Every value should now be 0
      for (const key in values) {
        expect(values[key]).to.equal(0)
      }
    })

    const billRunValues = (billRun) => {
      return {
        creditLineCount: billRun.creditLineCount,
        creditLineValue: billRun.creditLineValue,
        debitLineCount: billRun.debitLineCount,
        debitLineValue: billRun.debitLineValue,
        zeroLineCount: billRun.zeroLineCount,
        subjectToMinimumChargeCount: billRun.subjectToMinimumChargeCount,
        subjectToMinimumChargeCreditValue: billRun.subjectToMinimumChargeCreditValue,
        subjectToMinimumChargeDebitValue: billRun.subjectToMinimumChargeDebitValue,
        creditNoteCount: billRun.creditNoteCount,
        creditNoteValue: billRun.creditNoteValue,
        invoiceCount: billRun.invoiceCount,
        invoiceValue: billRun.invoiceValue
      }
    }

    it('deletes the invoice licences', async () => {
      const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

      await DeleteInvoiceService.go(invoice.id)

      const licences = await LicenceModel.query().select().where({ billRunId: billRun.id })
      expect(licences).to.be.empty()
    })

    it('deletes the invoice transactions', async () => {
      const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

      await DeleteInvoiceService.go(invoice.id)

      const transactions = await TransactionModel.query().select().where({ billRunId: billRun.id })
      expect(transactions).to.be.empty()
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
