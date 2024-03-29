'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const AuthorisationHelper = require('../support/helpers/authorisation.helper.js')
const AuthorisedSystemHelper = require('../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const GeneralHelper = require('../support/helpers/general.helper.js')
const NewInvoiceHelper = require('../support/helpers/new_invoice.helper.js')
const NewTransactionHelper = require('../support/helpers/new_transaction.helper.js')
const RegimeHelper = require('../support/helpers/regime.helper.js')

const Boom = require('@hapi/boom')

const DeleteInvoiceService = require('../../app/services/invoices/delete_invoice.service.js')
const InvoiceRebillingService = require('../../app/services/invoices/invoice_rebilling.service.js')
const InvoiceRebillingValidationService = require('../../app/services/invoices/invoice_rebilling_validation.service.js')
const ValidateInvoiceService = require('../../app/services/invoices/validate_invoice.service.js')

const BillRunModel = require('../../app/models/bill_run.model.js')
const InvoiceModel = require('../../app/models/invoice.model.js')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Invoices controller', () => {
  let server
  let authToken
  let invoice

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem('clientId', 'system1', [regime])

    invoice = await NewInvoiceHelper.create()
  })

  afterEach(async () => {
    Sinon.restore()
  })

  // DELETE Invoice
  for (const version of ['v2', 'v3']) {
    describe(`Delete an invoice: DELETE /${version}/{regimeSlug}/bill-runs/{billRunId}/invoices/{invoiceId}`, () => {
      const options = (token, billRunId, invoiceId) => {
        return {
          method: 'DELETE',
          url: `/${version}/wrls/bill-runs/${billRunId}/invoices/${invoiceId}`,
          headers: { authorization: `Bearer ${token}` }
        }
      }

      beforeEach(async () => {
        authToken = AuthorisationHelper.nonAdminToken('clientId')

        Sinon
          .stub(JsonWebToken, 'verify')
          .returns(AuthorisationHelper.decodeToken(authToken))
      })

      describe('When the request is valid', () => {
        let validateStub
        let deleteStub

        before(async () => {
          validateStub = Sinon.stub(ValidateInvoiceService, 'go').returns()
          deleteStub = Sinon.stub(DeleteInvoiceService, 'go').returns()
        })

        after(async () => {
          validateStub.restore()
          deleteStub.restore()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options(authToken, invoice.billRunId, invoice.id))

          expect(response.statusCode).to.equal(204)
        })
      })

      describe('When the request is invalid', () => {
        describe('because the invoice is not linked to the bill run', () => {
          let fetchStub

          before(async () => {
            fetchStub = Sinon.stub(ValidateInvoiceService, 'go').throws(Boom.conflict())
          })

          after(async () => {
            fetchStub.restore()
          })

          it('returns error status 409', async () => {
            const response = await server.inject(options(authToken, invoice.billRunId, invoice.id))

            expect(response.statusCode).to.equal(409)
          })
        })
      })
    })
  }

  for (const version of ['v2', 'v3']) {
    describe(`View bill run invoice: GET /${version}/{regimeSlug}/bill-runs/{billRunId}/invoices/{invoiceId}`, () => {
      const options = (token, billRunId, invoiceId) => {
        return {
          method: 'GET',
          url: `/${version}/wrls/bill-runs/${billRunId}/invoices/${invoiceId}`,
          headers: { authorization: `Bearer ${token}` }
        }
      }

      beforeEach(async () => {
        authToken = AuthorisationHelper.nonAdminToken('clientId')

        Sinon
          .stub(JsonWebToken, 'verify')
          .returns(AuthorisationHelper.decodeToken(authToken))
      })

      describe('When the request is valid', () => {
        it('returns success status 200', async () => {
          const transaction = await NewTransactionHelper.create()

          const response = await server.inject(options(authToken, transaction.billRunId, transaction.invoiceId))
          const responsePayload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(200)
          expect(responsePayload.invoice.id).to.equal(transaction.invoiceId)
          expect(responsePayload.invoice.licences).to.be.an.array()
          expect(responsePayload.invoice.licences[0].transactions).to.be.an.array()
        })
      })

      describe('When the request is invalid', () => {
        describe('because it is unknown', () => {
          it('returns error status 404', async () => {
            const unknownInvoiceId = GeneralHelper.uuid4()

            const response = await server.inject(options(authToken, invoice.billRunId, unknownInvoiceId))
            const responsePayload = JSON.parse(response.payload)

            expect(response.statusCode).to.equal(404)
            expect(responsePayload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
          })
        })

        describe('because it is not linked to the bill run', () => {
          it('throws an error', async () => {
            const newTransaction = await NewTransactionHelper.create()

            const response = await server.inject(options(authToken, invoice.billRunId, newTransaction.invoiceId))
            const responsePayload = JSON.parse(response.payload)

            expect(response.statusCode).to.equal(409)
            expect(responsePayload.message).to.equal(
            `Invoice ${newTransaction.invoiceId} is not linked to bill run ${invoice.billRunId}.`
            )
          })
        })
      })
    })
  }

  for (const version of ['v2', 'v3']) {
    describe(`Rebill bill run invoice: PATCH /${version}/{regimeSlug}/bill-runs/{billRunId}/invoices/{invoiceId}/rebill`, () => {
      let cancelInvoice
      let rebillInvoice
      let validationStub
      let rebillStub
      let response

      const options = (token, billRunId, invoiceId) => {
        return {
          method: 'PATCH',
          url: `/${version}/wrls/bill-runs/${billRunId}/invoices/${invoiceId}/rebill`,
          headers: { authorization: `Bearer ${token}` }
        }
      }

      beforeEach(async () => {
        authToken = AuthorisationHelper.nonAdminToken('clientId')

        Sinon
          .stub(JsonWebToken, 'verify')
          .returns(AuthorisationHelper.decodeToken(authToken))

        cancelInvoice = { id: GeneralHelper.uuid4(), rebilledType: 'C' }
        rebillInvoice = { id: GeneralHelper.uuid4(), rebilledType: 'R' }

        validationStub = Sinon.stub(InvoiceRebillingValidationService, 'go')
        rebillStub = Sinon.stub(InvoiceRebillingService, 'go')
          .returns({
            invoices: [cancelInvoice, rebillInvoice]
          })

        response = await server.inject(options(authToken, invoice.billRunId, invoice.id))
      })

      it('calls InvoiceRebillingValidationService with the specified bill run and invoice', async () => {
        expect(validationStub.calledOnce).to.be.true()
        expect(validationStub.getCall(0).args[0]).to.be.an.instanceof(BillRunModel)
        expect(validationStub.getCall(0).args[0].id).to.equal(invoice.billRunId)
        expect(validationStub.getCall(0).args[1]).to.be.an.instanceof(InvoiceModel)
        expect(validationStub.getCall(0).args[1].id).to.equal(invoice.id)
      })

      it('calls InvoiceRebillingService with the specified bill run and invoice', async () => {
        expect(rebillStub.calledOnce).to.be.true()
        expect(rebillStub.getCall(0).args[0]).to.be.an.instanceof(BillRunModel)
        expect(rebillStub.getCall(0).args[0].id).to.equal(invoice.billRunId)
        expect(rebillStub.getCall(0).args[1]).to.be.an.instanceof(InvoiceModel)
        expect(rebillStub.getCall(0).args[1].id).to.equal(invoice.id)
      })

      it('returns the expected 201 code and response from InvoiceRebillingService', async () => {
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(201)
        expect(responsePayload.invoices).length(2)
      })
    })
  }
})
