'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper')
const BillRunHelper = require('../../support/helpers/bill_run.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')
const GeneralHelper = require('../../support/helpers/general.helper')
const RegimeHelper = require('../../support/helpers/regime.helper')
const InvoiceHelper = require('../../support/helpers/invoice.helper')

// Things we need to stub
const { InvoiceRebillingCopyService } = require('../../../app/services')
const { InvoiceRebillingInitialiseService } = require('../../../app/services')

// Thing under test
const { InvoiceRebillingService } = require('../../../app/services')

describe('Invoice Rebilling service', () => {
  let authorisedSystem
  let invoice
  let billRun
  let notifierFake
  let cancelInvoice
  let rebillInvoice

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    const billedBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'billed')
    invoice = await InvoiceHelper.addInvoice(billedBillRun.id, 'CUSTOMER', '2021')

    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }

    cancelInvoice = { id: GeneralHelper.uuid4(), rebilledType: 'C' }
    rebillInvoice = { id: GeneralHelper.uuid4(), rebilledType: 'R' }
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When rebilling is successful', () => {
    let initialiseStub

    beforeEach(async () => {
      initialiseStub = Sinon.stub(InvoiceRebillingInitialiseService, 'go')
        .returns({ cancelInvoice, rebillInvoice })

      Sinon.stub(InvoiceRebillingCopyService, 'go')
    })

    it("creates the new 'cancel' and 'rebill' invoices by calling 'InvoiceRebillingInitialiseService'", async () => {
      const result = await InvoiceRebillingService.go(billRun, invoice, authorisedSystem, notifierFake)

      const returnedCancelObject = result.invoices.find(element => element.rebilledType === 'C')
      const returnedRebillObject = result.invoices.find(element => element.rebilledType === 'R')

      expect(initialiseStub.calledOnce).to.be.true()
      expect(returnedCancelObject.id).to.equal(cancelInvoice.id)
      expect(returnedRebillObject.id).to.equal(rebillInvoice.id)
    })

    it('returns a response containing the id and type of the rebilled invoices', async () => {
      const result = await InvoiceRebillingService.go(billRun, invoice, authorisedSystem, notifierFake)

      const returnedCancelObject = result.invoices.find(element => element.rebilledType === 'C')
      const returnedRebillObject = result.invoices.find(element => element.rebilledType === 'R')

      expect(returnedCancelObject.id).to.equal(cancelInvoice.id)
      expect(returnedCancelObject.rebilledType).to.equal(cancelInvoice.rebilledType)

      expect(returnedRebillObject.id).to.equal(rebillInvoice.id)
      expect(returnedRebillObject.rebilledType).to.equal(rebillInvoice.rebilledType)
    })
  })

  describe('If an error occurs', () => {
    describe('when initialising the rebilling invoices', () => {
      beforeEach(async () => {
        Sinon.stub(InvoiceRebillingInitialiseService, 'go').throws()
      })

      it('does not call the notifier', async () => {
        await expect(
          InvoiceRebillingService.go(billRun, invoice, authorisedSystem, notifierFake)
        ).to.reject()

        expect(notifierFake.omfg.callCount).to.equal(0)
      })

      it('does not return a result', async () => {
        const err = await expect(
          InvoiceRebillingService.go(billRun, invoice, authorisedSystem, notifierFake)
        ).to.reject()

        expect(err).to.be.an.error()
      })
    })

    describe('when copying the invoice', () => {
      beforeEach(async () => {
        Sinon.stub(InvoiceRebillingInitialiseService, 'go')
          .returns({ cancelInvoice, rebillInvoice })
        Sinon.stub(InvoiceRebillingCopyService, 'go').throws()
      })

      it('calls the notifier', async () => {
        await InvoiceRebillingService.go(billRun, invoice, authorisedSystem, notifierFake)

        expect(notifierFake.omfg.callCount).to.equal(1)
        expect(notifierFake.omfg.firstArg).to.equal('Error rebilling invoice')
      })

      it('still returns a response for the client system', async () => {
        const result = await InvoiceRebillingService.go(billRun, invoice, authorisedSystem, notifierFake)

        expect(result.invoices).length(2)
      })
    })
  })
})
