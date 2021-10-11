'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  DatabaseHelper,
  RegimeHelper
} = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const { CreateCustomerDetailsService } = require('../../app/services')

describe('Customer Details controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])

    Sinon.stub(CreateCustomerDetailsService, 'go').returns()
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Creating a details change: POST /v2/{regimeSlug}/customer-changes', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/customer-changes',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    describe('When the request is valid', () => {
      it('returns a 204 response', async () => {
        // We can pass an empty payload as we've stubbed the service
        const response = await server.inject(options(authToken, {}))

        expect(response.statusCode).to.equal(201)
      })
    })
  })
})
