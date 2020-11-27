'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../../../server')

// Test helpers
const { AuthorisationHelper, AuthorisedSystemHelper, DatabaseHelper } = require('../../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Database controller', () => {
  let server
  let authToken

  before(async () => {
    server = await deployment()
    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
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

      // We expect at least the following tables to exist
      // - authorised_systems
      // - authorised_systems_regimes
      // - knex_migrations
      // - knex_migrations_lock
      // - regimes
      expect(payload.length).to.be.at.least(5)
      expect(payload[0].relname).to.exist()
    })
  })
})
