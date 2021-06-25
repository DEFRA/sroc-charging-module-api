'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../../app/server')

// Test helpers
const { AuthorisationHelper, AuthorisedSystemHelper, DatabaseHelper } = require('../../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Database controller', () => {
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    await AuthorisedSystemHelper.addAdminSystem()
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Listing table stats: GET /admin/health/database', () => {
    const options = token => {
      return {
        method: 'GET',
        url: '/admin/health/database',
        headers: { authorization: `Bearer ${token}` }
      }
    }

    it('returns stats about each table', async () => {
      const response = await server.inject(options(authToken))

      const payload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)

      // We expect at least 5 tables to exist and be returned in the results
      expect(payload.length).to.be.at.least(5)
      expect(payload[0].relname).to.exist()
    })
  })
})
