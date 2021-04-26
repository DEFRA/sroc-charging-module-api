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
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  DatabaseHelper,
  GeneralHelper
} = require('../../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const { ListCustomerFilesService } = require('../../../../app/services')

describe('Test customer files controller', () => {
  let server
  let authToken
  let regime

  before(async () => {
    server = await deployment()
    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const authSystem = await AuthorisedSystemHelper.addAdminSystem()
    const regimes = await authSystem.$relatedQuery('regimes')
    regime = regimes.filter(r => r.slug === 'wrls')[0]
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Listing customer files: GET /admin/test/customer-files', () => {
    const options = (regime, token) => {
      return {
        method: 'GET',
        url: `/admin/test/${regime.slug}/customer-files`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When there are customer files', () => {
      beforeEach(async () => {
        Sinon.stub(ListCustomerFilesService, 'go').returns([
          {
            id: GeneralHelper.uuid4(),
            regimeId: regime.id,
            region: 'A',
            fileReference: 'nalac50001',
            status: 'exported'
          },
          {
            id: GeneralHelper.uuid4(),
            regimeId: regime.id,
            region: 'A',
            fileReference: 'nalac50002',
            status: 'pending'
          }
        ])
      })

      it('returns a list of customer files', async () => {
        const response = await server.inject(options(regime, authToken))

        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload.length).to.equal(2)
        expect(payload[1].fileReference).to.equal('nalac50002')
      })
    })
  })
})
