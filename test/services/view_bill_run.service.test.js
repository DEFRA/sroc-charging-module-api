// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import RulesServiceHelper from '../support/helpers/rules_service.helper.js'

// Things we need to stub
import RulesService from '../../app/services/rules.service.js'

// Additional dependencies needed
import CreateTransactionService from '../../app/services/create_transaction.service.js'
import GenerateBillRunService from '../../app/services/generate_bill_run.service.js'

// Thing under test
import ViewBillRunService from '../../app/services/view_bill_run.service.js'

// Fixtures
import * as fixtures from '../support/fixtures/fixtures.js'
const chargeFixtures = fixtures.calculateCharge
const requestFixtures = fixtures.createTransaction

// Test framework setup
const { afterEach, describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('View bill run service', () => {
  const rulesServiceResponse = chargeFixtures.presroc.simple
  let billRun
  let payload
  let regime
  let authorisedSystem
  let rulesServiceStub
  let creditLineValue
  let debitLineValue
  let minimumChargeDebitLineValue

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.presroc.simple)
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

    describe('when there is a deminimis invoice in the bill run', () => {
      beforeEach(async () => {
        debitLineValue = 100

        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, debitLineValue)
        await CreateTransactionService.go({
          ...payload,
          customerReference: 'DEBIT'
        }, billRun, authorisedSystem, regime)
      })

      describe('and the bill run is generated', () => {
        it('correctly calculates the net total', async () => {
          await GenerateBillRunService.go(billRun)

          const result = await ViewBillRunService.go(billRun.id)

          expect(result.billRun.netTotal).to.equal(0)
        })
      })
    })

    describe('when there is a deminimis invoice with minimum charge', () => {
      beforeEach(async () => {
        creditLineValue = 2365
        minimumChargeDebitLineValue = 1

        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, minimumChargeDebitLineValue)
        await CreateTransactionService.go({
          ...payload,
          subjectToMinimumCharge: true
        }, billRun, authorisedSystem, regime)

        rulesServiceStub.restore()
        RulesServiceHelper.mockValue(Sinon, RulesService, rulesServiceResponse, creditLineValue)
        await CreateTransactionService.go({
          ...payload,
          credit: true
        }, billRun, authorisedSystem, regime)
      })

      describe('and the bill run is generated', () => {
        it('correctly calculates the net total', async () => {
          await GenerateBillRunService.go(billRun)

          const result = await ViewBillRunService.go(billRun.id)

          expect(result.billRun.netTotal).to.equal(0)
        })
      })
    })

    describe('when the bill run is overall in credit', () => {
      beforeEach(async () => {
        creditLineValue = 5000
        debitLineValue = 1000

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
      })

      describe('and the bill run is generated', () => {
        it('correctly calculates the net total', async () => {
          await GenerateBillRunService.go(billRun)

          const result = await ViewBillRunService.go(billRun.id)

          expect(result.billRun.netTotal).to.equal(debitLineValue - creditLineValue)
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
