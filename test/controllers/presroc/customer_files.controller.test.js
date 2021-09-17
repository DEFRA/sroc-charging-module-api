'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../app/server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  DatabaseHelper,
  RegimeHelper
} = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('List Customer Files controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  after(async () => {
    Sinon.restore()
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  describe('List customer files: GET /v2/{regimeId}/customer-files', () => {
    const options = (token) => {
      return {
        method: 'GET',
        url: '/v2/wrls/customer-files',
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      it('returns `true`', async () => {
        const response = await server.inject(options(authToken))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload).to.be.true()
      })
    })
  })
})
