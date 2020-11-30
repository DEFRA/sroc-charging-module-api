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

describe.only('Presroc Bill Runs controller', () => {
  const clientID = '1234546789'
  let server
  let authToken

  before(async () => {
    server = await deployment()
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Adding an authorised system: POST /v2/{regimeId}/billruns', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: '/v2/wrls/billruns',
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    it("adds a new bill run and returns it's details including the 'id'", async () => {
      const requestPayload = {
        region: 'A'
      }

      const response = await server.inject(options(authToken, requestPayload))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(201)
      expect(responsePayload.id).to.exist()
      expect(responsePayload.region).to.equal(requestPayload.region)
    })

    it('will not add an bill run with invalid data', async () => {
      const requestPayload = {
        region: 'Z'
      }

      const response = await server.inject(options(authToken, requestPayload))

      expect(response.statusCode).to.equal(422)
    })
  })
})
