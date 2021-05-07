'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../../server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper,
  TransactionHelper,
  InvoiceHelper
} = require('../../support/helpers')

const Boom = require('@hapi/boom')

const {
  DeleteInvoiceService,
  FetchAndValidateBillRunInvoiceService,
  InvoiceRebillingInitialiseService,
  InvoiceRebillingService,
  InvoiceRebillingValidationService
} = require('../../../app/services')

const { BillRunModel, InvoiceModel } = require('../../../app/models')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Presroc Invoices controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun
  let invoice

  before(async () => {
    server = await deployment()
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER', '2020')
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Delete an invoice: DELETE /v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}', () => {
    const options = (token, billRunId, invoiceId) => {
      return {
        method: 'DELETE',
        url: `/v2/wrls/bill-runs/${billRunId}/invoices/${invoiceId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      let fetchStub
      let deleteStub

      before(async () => {
        fetchStub = Sinon.stub(FetchAndValidateBillRunInvoiceService, 'go').returns()
        deleteStub = Sinon.stub(DeleteInvoiceService, 'go').returns()
      })

      after(async () => {
        fetchStub.restore()
        deleteStub.restore()
      })

      it('returns a 204 response', async () => {
        const response = await server.inject(options(authToken, billRun.id, invoice.id))

        expect(response.statusCode).to.equal(204)
      })
    })

    describe('When the request is invalid', () => {
      describe('because the invoice does not exist', () => {
        let fetchStub

        before(async () => {
          fetchStub = Sinon.stub(FetchAndValidateBillRunInvoiceService, 'go').throws(Boom.notFound())
        })

        after(async () => {
          fetchStub.restore()
        })

        it('returns error status 404', async () => {
          const response = await server.inject(options(authToken, billRun.id, invoice.id))

          expect(response.statusCode).to.equal(404)
        })
      })

      describe('because the invoice is not linked to the bill run', () => {
        let fetchStub

        before(async () => {
          fetchStub = Sinon.stub(FetchAndValidateBillRunInvoiceService, 'go').throws(Boom.conflict())
        })

        after(async () => {
          fetchStub.restore()
        })

        it('returns error status 409', async () => {
          const response = await server.inject(options(authToken, billRun.id, invoice.id))

          expect(response.statusCode).to.equal(409)
        })
      })
    })
  })

  describe('View bill run invoice: GET /v2/{regimeId}/bill-runs/{billRunId}/invoice/{invoiceId}', () => {
    const options = (token, billRunId, invoiceId) => {
      return {
        method: 'GET',
        url: `/v2/wrls/bill-runs/${billRunId}/invoices/${invoiceId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      it('returns success status 200', async () => {
        await TransactionHelper.addTransaction(billRun.id)
        const transactions = await billRun.$relatedQuery('transactions')
        const invoiceId = transactions[0].invoiceId

        const response = await server.inject(options(authToken, billRun.id, invoiceId))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.invoice.id).to.equal(invoiceId)
        expect(responsePayload.invoice.licences).to.be.an.array()
        expect(responsePayload.invoice.licences[0].transactions).to.be.an.array()
      })
    })

    describe('When the request is invalid', () => {
      describe('because it is unknown', () => {
        it('returns error status 404', async () => {
          const unknownInvoiceId = GeneralHelper.uuid4()

          const response = await server.inject(options(authToken, billRun.id, unknownInvoiceId))
          const responsePayload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(404)
          expect(responsePayload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
        })
      })

      describe('because it is not linked to the bill run', () => {
        it('throws an error', async () => {
          const otherBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
          await TransactionHelper.addTransaction(otherBillRun.id)
          const transactions = await otherBillRun.$relatedQuery('transactions')
          const invoiceId = transactions[0].invoiceId

          const response = await server.inject(options(authToken, billRun.id, invoiceId))
          const responsePayload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(409)
          expect(responsePayload.message).to.equal(
            `Invoice ${invoiceId} is not linked to bill run ${billRun.id}.`
          )
        })
      })
    })
  })

  describe('Rebill bill run invoice: PATCH /v2/{regimeId}/bill-runs/{billRunId}/invoice/{invoiceId}/rebill', () => {
    let cancelInvoice
    let rebillInvoice
    let validationStub
    let initialiseStub
    let rebillStub
    let response

    beforeEach(async () => {
      cancelInvoice = { id: GeneralHelper.uuid4() }
      rebillInvoice = { id: GeneralHelper.uuid4() }

      validationStub = Sinon.stub(InvoiceRebillingValidationService, 'go')
      initialiseStub = Sinon.stub(InvoiceRebillingInitialiseService, 'go')
        .returns({
          cancelInvoice,
          rebillInvoice,
          response: { msg: 'REBILL_OK' }
        })
      rebillStub = Sinon.stub(InvoiceRebillingService, 'go')

      response = await server.inject(options(authToken, billRun.id, invoice.id))
    })

    afterEach(async () => {
      validationStub.restore()
      initialiseStub.restore()
      rebillStub.restore()
    })

    const options = (token, billRunId, invoiceId) => {
      return {
        method: 'PATCH',
        url: `/v2/wrls/bill-runs/${billRunId}/invoices/${invoiceId}/rebill`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    it('calls InvoiceRebillingValidationService with the specified bill run and invoice', async () => {
      expect(validationStub.calledOnce).to.be.true()
      expect(validationStub.getCall(0).args[0]).to.be.an.instanceof(BillRunModel)
      expect(validationStub.getCall(0).args[0].id).to.equal(billRun.id)
      expect(validationStub.getCall(0).args[1]).to.be.an.instanceof(InvoiceModel)
      expect(validationStub.getCall(0).args[1].id).to.equal(invoice.id)
    })

    it('calls InvoiceRebillingInitialiseService with the specified bill run and invoice', async () => {
      expect(initialiseStub.calledOnce).to.be.true()
      expect(initialiseStub.getCall(0).args[0]).to.be.an.instanceof(BillRunModel)
      expect(initialiseStub.getCall(0).args[0].id).to.equal(billRun.id)
      expect(initialiseStub.getCall(0).args[1]).to.be.an.instanceof(InvoiceModel)
      expect(initialiseStub.getCall(0).args[1].id).to.equal(invoice.id)
    })

    it('calls InvoiceRebillingService with the specified invoice and the initialised invoices', async () => {
      expect(rebillStub.calledOnce).to.be.true()
      expect(rebillStub.getCall(0).args[0]).to.be.an.instanceof(InvoiceModel)
      expect(rebillStub.getCall(0).args[0].id).to.equal(invoice.id)
      expect(rebillStub.getCall(0).args[1].id).to.equal(cancelInvoice.id)
      expect(rebillStub.getCall(0).args[2].id).to.equal(rebillInvoice.id)
    })

    it('returns the expected 201 code and response from InvoiceRebillingInitialiseService', async () => {
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(201)
      expect(responsePayload.msg).to.equal('REBILL_OK')
    })
  })
})
