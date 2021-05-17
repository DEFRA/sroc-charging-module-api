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
  BillRunHelper,
  DatabaseHelper,
  RegimeHelper
} = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Presroc Bill Runs controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun

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
    authorisedSystem = await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Send bill run: PATCH /admin/{regimeId}/bill-runs/{billRunId}/send', () => {
    const options = (token, billRunId) => {
      return {
        method: 'PATCH',
        url: `/admin/wrls/bill-runs/${billRunId}/send`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    })

    describe('When the request is valid', () => {
      it('returns success status 200', async () => {
        const response = await server.inject(options(authToken, billRun.id))

        expect(response.statusCode).to.equal(200)
      })
    })
  })
})
