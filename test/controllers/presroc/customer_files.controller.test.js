'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
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
const { ListCustomerFilesService } = require('../../../app/services')

describe('List Customer Files controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime

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

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  describe('List customer files: GET /v2/{regimeId}/customer-files', () => {
    let listStub

    const options = (token, pathParam = '') => {
      return {
        method: 'GET',
        url: `/v2/${regime.slug}/customer-files/${pathParam}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    beforeEach(async () => {
      listStub = Sinon.stub(ListCustomerFilesService, 'go')
    })

    afterEach(async () => {
      listStub.restore()
    })

    describe('When the request is valid', () => {
      it('returns a 200 response', async () => {
        const response = await server.inject(options(authToken))

        expect(response.statusCode).to.equal(200)
      })

      it('calls ListCustomerFilesService', async () => {
        await server.inject(options(authToken))

        expect(listStub.calledOnce).to.be.true()
      })

      it('passes the regime to ListCustomerFilesService', async () => {
        await server.inject(options(authToken))

        expect(listStub.firstCall.firstArg.id).to.equal(regime.id)
      })

      it('passes the days parameter to ListCustomerFilesService', async () => {
        await server.inject(options(authToken, '30'))

        expect(listStub.firstCall.args[1]).to.equal('30')
      })
    })
  })
})
