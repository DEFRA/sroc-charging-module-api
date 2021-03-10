'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, describe, it, beforeEach } = exports.lab = Lab.script()
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

const { CreateTransactionService, GenerateBillRunService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { ViewBillRunService } = require('../../app/services')

describe('View bill run service', () => {
  let billRun
  let payload
  let regime
  let authorisedSystem
  let rulesServiceStub
  let creditLineValue
  let debitLineValue

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When there is a matching bill run', () => {
    beforeEach(async () => {
      rulesServiceStub = Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    })

    it('returns the correct basic info', async () => {
      const result = await ViewBillRunService.go(billRun.id)

      expect(result.billRun.id).to.equal(billRun.id)
      expect(result.billRun.region).to.equal(billRun.region)
      expect(result.billRun.status).to.equal(billRun.status)
    })

    describe('when transactions are added to the bill run', () => {
      beforeEach(async () => {
        creditLineValue = 1000
        debitLineValue = 5000

        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, creditLineValue)
        await CreateTransactionService.go({
          ...payload,
          customerReference: 'CREDIT',
          credit: true
        }, billRun, authorisedSystem, regime)

        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, debitLineValue)
        await CreateTransactionService.go({
          ...payload,
          customerReference: 'DEBIT'
        }, billRun, authorisedSystem, regime)

        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, 0)
        await CreateTransactionService.go({
          ...payload,
          customerReference: 'ZERO'
        }, billRun, authorisedSystem, regime)
      })

      it('returns the net total', async () => {
        const result = await ViewBillRunService.go(billRun.id)

        expect(result.billRun.netTotal).to.equal(debitLineValue - creditLineValue)
      })

      it('returns the invoices', async () => {
        const result = await ViewBillRunService.go(billRun.id)

        expect(result.billRun.invoices.length).to.equal(3)
      })

      it('returns the licences under the invoices', async () => {
        const result = await ViewBillRunService.go(billRun.id)

        const licences = result.billRun.invoices.map(invoice => invoice.licences).flat()

        expect(licences.length).to.equal(3)
      })

      it('only returns the licence id and number', async () => {
        const result = await ViewBillRunService.go(billRun.id)

        const licences = result.billRun.invoices.map(invoice => invoice.licences).flat()

        licences.forEach(licence => {
          expect(licence).to.only.include(['id', 'licenceNumber'])
        })
      })

      describe('when the bill run is generated', () => {
        it('returns correct invoice-level values', async () => {
          await GenerateBillRunService.go(billRun)

          const result = await ViewBillRunService.go(billRun.id)

          expect(result.billRun.creditNoteCount).to.equal(1)
          expect(result.billRun.creditNoteValue).to.equal(creditLineValue)
          expect(result.billRun.invoiceCount).to.equal(1)
          expect(result.billRun.invoiceValue).to.equal(debitLineValue)
        })
      })
    })
  })

  describe('When there is no matching bill run', () => {
    it('throws an error', async () => {
      const unknownBillRunId = GeneralHelper.uuid4()
      const err = await expect(ViewBillRunService.go(unknownBillRunId)).to.reject()

      expect(err).to.be.an.error()
      expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
    })
  })
})
