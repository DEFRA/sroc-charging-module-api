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
  DatabaseHelper,
  RegimeHelper
} = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Presroc Invoices controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime

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
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Delete an invoice: DELETE /v2/{regimeId}/invoices/{invoiceId}', () => {
    const options = (token, invoiceId) => {
      return {
        method: 'DELETE',
        url: `/v2/wrls/invoices/${invoiceId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    it('returns a 200 response', async () => {
      const response = await server.inject(options(authToken, 'INVOICE_ID'))

      expect(response.statusCode).to.equal(200)
    })
  })
})
