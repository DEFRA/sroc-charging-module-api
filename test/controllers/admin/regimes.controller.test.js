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
const { AuthorisationHelper } = require('../../support/helpers')
const { AuthorisedSystemHelper } = require('../../support/helpers')
const { DatabaseHelper } = require('../../support/helpers')
const { GeneralHelper } = require('../../support/helpers')
const { RegimeHelper } = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Regimes controller', () => {
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

        // In order to authenticate we need to have an admin authorised system so we call
        // `AuthorisedSystemHelper.addAdminSystem()` in the `beforeEach` block. To reflect the fact an admin user will
        // always be seeded with authorisations for the existing regimes the helper automatically creates 'wrls' and
        // links the admin user to it. This is why though it looks like only 3 have been added, we get 4 regimes back
        // the first of which is 'wrls'
        expect(response.statusCode).to.equal(200)
        expect(payload.length).to.equal(4)
        expect(payload[1].slug).to.equal('ice')
      })
    })
  })

  describe('View regime: GET /admin/regimes/{id}', () => {
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
        const id = GeneralHelper.uuid4()
        const response = await server.inject(options(id, authToken))

        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(404)
        expect(payload.message).to.equal(`No regime found with id ${id}`)
      })
    })
  })
})
