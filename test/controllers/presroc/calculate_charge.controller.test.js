// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Nock from 'nock'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../../support/helpers/database.helper.js'
import GeneralHelper from '../../support/helpers/general.helper.js'
import RegimeHelper from '../../support/helpers/regime.helper.js'
import RulesServiceHelper from '../../support/helpers/rules_service.helper.js'

// Things we need to stub
import JsonWebToken from 'jsonwebtoken'

// For running our service
import { init } from '../../../app/server.js'

// Fixtures
import * as fixtures from '../../support/fixtures/fixtures.js'
const chargeFixtures = fixtures.calculateCharge

// Test framework setup
const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

describe('Calculate charge controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))

    // Intercept all requests in this test suite as we don't actually want to call the service. Tell Nock to persist()
    // the interception rather than remove it after the first request
    Nock(RulesServiceHelper.url)
      .post(() => true)
      .reply(200, chargeFixtures.simple.rulesService)
      .persist()
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('Calculating a charge: POST /v2/{regimeId}/calculate-charge', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/calculate-charge',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    describe('When the request is valid', () => {
      it('returns the calculated charge', async () => {
        const requestPayload = chargeFixtures.simple.request

        const response = await server.inject(options(authToken, requestPayload))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload).to.equal(chargeFixtures.simple.response)
      })
    })

    describe('When the request is invalid', () => {
      it('returns an error', async () => {
        const requestPayload = GeneralHelper.cloneObject(chargeFixtures.simple.request)
        requestPayload.periodStart = '01-APR-2021'

        const response = await server.inject(options(authToken, requestPayload))

        expect(response.statusCode).to.equal(422)
      })
    })
  })
})
