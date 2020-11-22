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
const { AuthorisationHelper, AuthorisedSystemHelper, DatabaseHelper, RegimeHelper } = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Regimes controller', () => {
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

  describe('Listing regimes: GET /admin/regimes', () => {
    const options = token => {
      return {
        method: 'GET',
        url: '/admin/regimes',
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When there are regimes', () => {
      beforeEach(async () => {
        await RegimeHelper.addRegime('ice', 'Ice')
        await RegimeHelper.addRegime('wind', 'Wind')
        await RegimeHelper.addRegime('fire', 'Fire')
      })

      it('returns list of regimes', async () => {
        const response = await server.inject(options(authToken))

        const payload = JSON.parse(response.payload)

        expect(payload.length).to.equal(3)
        expect(payload[0].slug).to.equal('ice')
      })
    })

    describe('When there are no regimes', () => {
      it('returns an empty list', async () => {
        const response = await server.inject(options(authToken))

        const payload = JSON.parse(response.payload)

        expect(payload.length).to.equal(0)
      })
    })
  })

  describe('Show regime: GET /admin/regimes/{id}', () => {
    const options = (id, token) => {
      return {
        method: 'GET',
        url: `/admin/regimes/${id}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When there the regime exists', () => {
      it('returns the matching regime', async () => {
        const regime = await RegimeHelper.addRegime('ice', 'Ice')

        const response = await server.inject(options(regime.id, authToken))
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload.slug).to.equal('ice')
      })
    })

    describe('When the regime does not exist', () => {
      it("returns a 404 'not found' response", async () => {
        const id = 'f0d3b4dc-2cae-11eb-adc1-0242ac120002'
        const response = await server.inject(options(id, authToken))

        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(404)
        expect(payload.message).to.equal(`No regime found with id ${id}`)
      })
    })
  })
})
