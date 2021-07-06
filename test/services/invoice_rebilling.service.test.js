// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import InvoiceHelper from '../support/helpers/invoice.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Things we need to stub
import InvoiceRebillingCopyService from '../../app/services/invoice_rebilling_copy.service.js'
import InvoiceRebillingInitialiseService from '../../app/services/invoice_rebilling_initialise.service.js'

// Thing under test
import InvoiceRebillingService from '../../app/services/invoice_rebilling.service.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

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
