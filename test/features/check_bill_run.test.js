'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper,
  RouteHelper,
  SequenceCounterHelper
} = require('../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Checking bill runs in requests', () => {
  let server
  let billRun
  let authToken
  const nonAdminClientId = '1234546789'

  before(async () => {
    await DatabaseHelper.clean()

    const regime = await RegimeHelper.addRegime('wrls', 'Water')

    await AuthorisedSystemHelper.addSystem(nonAdminClientId, 'system', [regime])

    await SequenceCounterHelper.addSequenceCounter(regime.id, 'A')
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)

    server = await deployment()

    RouteHelper.addBillRunGetRoute(server)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe("When the route is for a 'bill run'", () => {
    beforeEach(async () => {
      authToken = AuthorisationHelper.nonAdminToken(nonAdminClientId)

      Sinon
        .stub(JsonWebToken, 'verify')
        .returns(AuthorisationHelper.decodeToken(authToken))
    })

    describe('and the request is valid', () => {
      const options = id => {
        return {
          method: 'GET',
          url: `/test/wrls/bill-runs/${id}`,
          headers: { authorization: `Bearer ${authToken}` }
        }
      }

      it('adds the matching bill run to the request', async () => {
        const response = await server.inject(options(billRun.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.id).to.equal(billRun.id)
      })
    })
  })
})
