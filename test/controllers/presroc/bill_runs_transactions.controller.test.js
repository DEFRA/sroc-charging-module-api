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
  GeneralHelper,
  RegimeHelper,
  TransactionHelper
} = require('../../support/helpers')

const { presroc: requestFixtures } = require('../../support/fixtures/create_transaction')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Presroc Bill runs transactions controller', () => {
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
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Create a bill run transaction: POST /v2/{regimeId}/bill-runs/{billRunId}/transactions', () => {
    let payload

    const options = (token, payload, billRunId) => {
      return {
        method: 'POST',
        url: `/v2/wrls/bill-runs/${billRunId}/transactions`,
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    beforeEach(async () => {
      // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
      // the valid tests we can use it straight as
      payload = GeneralHelper.cloneObject(requestFixtures.simple)
    })

    describe('When the request is valid', () => {
      it("returns the 'id' of the new transaction", async () => {
        const response = await server.inject(options(authToken, payload, billRun.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(201)
        expect(responsePayload.transaction.id).to.exist()
      })
    })

    describe('When the request is invalid', () => {
      describe('because it contains invalid data', () => {
        it('returns an error', async () => {
          payload.periodStart = '01-APR-2021'

          const response = await server.inject(options(authToken, payload, billRun.id))

          expect(response.statusCode).to.equal(422)
        })
      })

      describe("because the request is for a duplicate transaction (matching clientId's)", () => {
        it('returns an error', async () => {
          // Add the first transaction
          await TransactionHelper.addTransaction(
            billRun.id,
            { createdBy: authorisedSystem.id, regimeId: regime.id, clientId: 'DOUBLEIMPACT' }
          )

          payload.clientId = 'DOUBLEIMPACT'

          // Attempt to add the second
          const response = await server.inject(options(authToken, payload, billRun.id))

          expect(response.statusCode).to.equal(409)
        })
      })
    })
  })

  describe('View bill run transaction: GET /v2/{regimeId}/bill-runs/{billRunId}/transactions/{transactionId}', () => {
    const options = (token, billRunId, transactionId) => {
      return {
        method: 'GET',
        url: `/v2/wrls/bill-runs/${billRunId}/transactions/${transactionId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the request is valid', () => {
      it('returns success status 200', async () => {
        const transaction = await TransactionHelper.addTransaction(
          billRun.id,
          { createdBy: authorisedSystem.id, regimeId: regime.id }
        )

        const response = await server.inject(options(authToken, billRun.id, transaction.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.transaction.id).to.equal(transaction.id)
      })
    })
  })
})
