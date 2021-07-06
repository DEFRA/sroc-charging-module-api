// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../../support/helpers/database.helper.js'
import RegimeHelper from '../../support/helpers/regime.helper.js'

// Things we need to stub
import CreateCustomerDetailsService from '../../../app/services/create_customer_details.service.js'
import JsonWebToken from 'jsonwebtoken'

// For running our service
import { init } from '../../../app/server.js'

// Test framework setup
const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

describe('Customer Details controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])

    Sinon.stub(CreateCustomerDetailsService, 'go').returns()
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Creating a details change: POST /v2/{regimeId}/customer-changes', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/customer-changes',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    describe('When the request is valid', () => {
      it('returns a 204 response', async () => {
        // We can pass an empty payload as we've stubbed the service
        const response = await server.inject(options(authToken, {}))

        expect(response.statusCode).to.equal(201)
      })
    })
  })
})
