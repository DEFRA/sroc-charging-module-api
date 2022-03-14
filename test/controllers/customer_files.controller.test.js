'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const AuthorisationHelper = require('../support/helpers/authorisation.helper')
const AuthorisedSystemHelper = require('../support/helpers/authorised_system.helper')
const DatabaseHelper = require('../support/helpers/database.helper')
const RegimeHelper = require('../support/helpers/regime.helper')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const ListCustomerFilesService = require('../../app/services/files/customers/list_customer_files.service')

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

  for (const version of ['v2', 'v3']) {
    describe(`List customer files: GET /${version}/{regimeSlug}/customer-files/{days?}`, () => {
      let listStub

      const options = (token, pathParam = '') => {
        return {
          method: 'GET',
          url: `/${version}/${regime.slug}/customer-files/${pathParam}`,
          headers: { authorization: `Bearer ${token}` }
        }
      }

      beforeEach(async () => {
        listStub = Sinon.stub(ListCustomerFilesService, 'go').returns(['result'])
      })

      afterEach(async () => {
        listStub.restore()
      })

      describe('When the request is valid', () => {
        it('returns a 200 response', async () => {
          const response = await server.inject(options(authToken))

          expect(response.statusCode).to.equal(200)
        })

        it('returns the output of ListCustomerFilesService', async () => {
          const response = await server.inject(options(authToken))
          const payload = JSON.parse(response.payload)

          expect(payload).to.equal(['result'])
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
          await server.inject(options(authToken, '15'))

          expect(listStub.firstCall.args[1]).to.equal(15)
        })

        it('accepts a value of 0 days', async () => {
          await server.inject(options(authToken, '0'))

          expect(listStub.firstCall.args[1]).to.equal(0)
        })

        it('defaults to 30 days if the days parameter is not specified', async () => {
          await server.inject(options(authToken))

          expect(listStub.firstCall.args[1]).to.equal(30)
        })
      })

      describe('When the request is invalid', () => {
        describe('because an invalid days parameter was provided', () => {
          it('returns a 400 response', async () => {
            const response = await server.inject(options(authToken, 'FAIL'))

            expect(response.statusCode).to.equal(400)
          })
        })

        describe('because a string was provided for the days parameter', () => {
          it('returns a 400 response', async () => {
            const response = await server.inject(options(authToken, 'FAIL'))

            expect(response.statusCode).to.equal(400)
          })
        })

        describe('because a negative number was provided for the days parameter', () => {
          it('returns a 400 response', async () => {
            const response = await server.inject(options(authToken, '-1'))

            expect(response.statusCode).to.equal(400)
          })
        })

        describe('because a non-integer number was provided for the days parameter', () => {
          it('returns a 400 response', async () => {
            const response = await server.inject(options(authToken, '4.2'))

            expect(response.statusCode).to.equal(400)
          })
        })
      })
    })
  }
})
