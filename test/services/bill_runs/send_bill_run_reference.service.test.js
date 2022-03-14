'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const InvoiceHelper = require('../../support/helpers/invoice.helper.js')
const RegimeHelper = require('../../support/helpers/regime.helper.js')
const SequenceCounterHelper = require('../../support/helpers/sequence_counter.helper.js')

const BillRunModel = require('../../../app/models/bill_run.model.js')

// Thing under test
const SendBillRunReferenceService = require('../../../app/services/bill_runs/send_bill_run_reference.service.js')

describe('Send Bill Run Reference service', () => {
  let regime
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(regime.id, GeneralHelper.uuid4())
    await SequenceCounterHelper.addSequenceCounter(regime.id, billRun.region)
  })

  describe('When the bill run can be sent', () => {
    beforeEach(async () => {
      billRun.status = 'approved'
    })

    it('initially sets the bill run status to `pending`', async () => {
      const spy = Sinon.spy(BillRunModel, 'query')

      await SendBillRunReferenceService.go(regime, billRun)

      /**
       * Iterate over each query call to get the underlying SQL query:
       *   .getCall gives us the given call
       *   The Objection function we spy on returns a query object so we get the returnValue
       *   .toKnexQuery() gives us the underlying Knex query
       *   .toString() gives us the SQL query as a string
       *
       * Finally, we push query strings to the queries array if they set the status to 'pending'.
       */
      const queries = []
      for (let call = 0; call < spy.callCount; call++) {
        const queryString = spy.getCall(call).returnValue.toKnexQuery().toString()
        if (queryString.includes('set "status" = \'pending\'')) {
          queries.push(queryString)
        }
      }

      expect(queries.length).to.equal(1)
    })

    it('sets the bill run status to `sending`', async () => {
      const sentBillRun = await SendBillRunReferenceService.go(regime, billRun)

      expect(sentBillRun.status).to.equal('sending')
    })

    describe('generates a file reference for the bill run', () => {
      beforeEach(async () => {
        // A bill run needs at least one billable invoice for a file reference to be generated
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 501, 0) // standard debit
      })

      it('for presroc', async () => {
        const sentBillRun = await SendBillRunReferenceService.go(regime, billRun)

        expect(sentBillRun.fileReference).to.equal('nalai50001')
      })

      it('for sroc', async () => {
        billRun.ruleset = 'sroc'

        const sentBillRun = await SendBillRunReferenceService.go(regime, billRun)

        expect(sentBillRun.fileReference).to.equal('nalai50001t')
      })
    })

    describe('for each invoice linked to the bill run', () => {
      beforeEach(async () => {
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 350, 0) // deminimis debit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 0, 0, 1, 501, 0) // standard debit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000003', 2020, 1, 350, 0, 0, 0) // standard credit < deminimis
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000004', 2020, 1, 501, 0, 0, 0) // standard credit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000005', 2020, 0, 0, 0, 0, 1) // zero value
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000006', 2020, 0, 0, 1, 501, 0, 1, 0, 501) // std minimum charge
      })

      it('generates and assigns a transaction reference to only the billable invoices', async () => {
        await SendBillRunReferenceService.go(regime, billRun)

        const invoices = await billRun.$relatedQuery('invoices')
        const updatedInvoices = invoices
          .filter(invoice => invoice.transactionReference)
          .map(invoice => invoice.customerReference)
        const billableInvoices = ['CMA0000002', 'CMA0000003', 'CMA0000004', 'CMA0000006']

        expect(updatedInvoices).to.only.include(billableInvoices)
      })
    })

    describe('but none of its invoices are billable', () => {
      beforeEach(async () => {
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000001', 2020, 0, 0, 1, 350, 0) // deminimis debit
        await InvoiceHelper.addInvoice(billRun.id, 'CMA0000002', 2020, 0, 0, 0, 0, 1) // zero value
      })

      it('still updates the status to sending', async () => {
        const sentBillRun = await SendBillRunReferenceService.go(regime, billRun)

        expect(sentBillRun.status).to.equal('sending')
      })

      it('it does not assign a file reference', async () => {
        const sentBillRun = await SendBillRunReferenceService.go(regime, billRun)

        expect(sentBillRun.fileReference).to.be.null()
      })
    })
  })

  describe('When the bill run cannot be sent', () => {
    describe('because the status is not `approved`', () => {
      it('throws an error', async () => {
        const err = await expect(SendBillRunReferenceService.go(regime, billRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${billRun.id} does not have a status of 'approved'.`)
      })
    })
  })
})
