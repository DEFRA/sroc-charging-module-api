'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../../server')

const { InvoiceModel } = require('../../../app/models')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  InvoiceHelper,
  RegimeHelper,
  TransactionHelper
} = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Presroc Invoices controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun

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
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Delete an invoice: DELETE /v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}', () => {
    let transaction

    beforeEach(async () => {
      transaction = await TransactionHelper.addTransaction(billRun.id)
    })

    const options = (token, billRunId, invoiceId) => {
      return {
        method: 'DELETE',
        url: `/v2/wrls/bill-runs/${billRunId}/invoices/${invoiceId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    it('returns a 204 response', async () => {
      const response = await server.inject(options(authToken, billRun.id, transaction.invoiceId))

      expect(response.statusCode).to.equal(204)
    })

    it('deletes the invoice', async () => {
      await server.inject(options(authToken, billRun.id, transaction.invoiceId))
      const invoice = await InvoiceModel.query().findById(transaction.invoiceId)

      expect(invoice).to.equal(undefined)
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
        billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
        const invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER_REFERENCE', 2021)

        const response = await server.inject(options(authToken, billRun.id, invoice.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.invoice.id).to.equal(invoice.id)
      })
    })
  })
})
