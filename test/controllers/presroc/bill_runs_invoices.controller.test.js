'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../../server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  InvoiceHelper,
  RegimeHelper
} = require('../../support/helpers')

const { InvoiceModel } = require('../../../app/models')

const { CreateTransactionService } = require('../../../app/services')

const { presroc: requestFixtures } = require('../../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const { RulesService } = require('../../../app/services')

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
    const options = (token, billRunId, invoiceId) => {
      return {
        method: 'DELETE',
        url: `/v2/wrls/bill-runs/${billRunId}/invoices/${invoiceId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      it('returns a 204 response', async () => {
        Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
        await CreateTransactionService.go(requestFixtures.simple, billRun.id, authorisedSystem, regime)
        const invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })

        const response = await server.inject(options(authToken, billRun.id, invoice.id))

        expect(response.statusCode).to.equal(204)
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
