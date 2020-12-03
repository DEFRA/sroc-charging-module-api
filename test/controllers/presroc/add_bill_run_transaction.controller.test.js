'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { deployment } = require('../../../server')

// Test helpers
const { AuthorisationHelper } = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe.only('Presroc Add Bill Run Transaction controller', () => {
  const clientID = '1234546789'
  const billRunId = 'b976d8e4-3644-11eb-adc1-0242ac120002'
  let server
  let authToken

  before(async () => {
    server = await deployment()
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Add a bill run transaction: POST /v2/{regimeId}/bill-runs/{billRunId}/transactions', () => {
    const options = (token, payload) => {
      return {
        method: 'POST',
        url: `/v2/wrls/bill-runs/${billRunId}/transactions`,
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    it('responds to POST request', async () => {
      const response = await server.inject(options(authToken, {}))

      expect(response.statusCode).to.equal(200)
    })
  })
})
