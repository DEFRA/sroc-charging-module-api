'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../../app/server')

// Test helpers
const {
  AuthorisationHelper,
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  TransactionHelper
} = require('../../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Test transactions controller', () => {
  let server
  let authToken
  let billRun

  before(async () => {
    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    await AuthorisedSystemHelper.addAdminSystem()
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  after(async () => {
    Sinon.restore()
  })

  describe('Show transaction: GET /admin/test/transactions/{id}', () => {
    const options = (id, token) => {
      return {
        method: 'GET',
        url: `/admin/test/transactions/${id}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When the transaction exists', () => {
      it('returns the matching transaction', async () => {
        const transaction = await TransactionHelper.addTransaction(billRun.id)

        const response = await server.inject(options(transaction.id, authToken))
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload.id).to.equal(transaction.id)
      })
    })

    describe('When the transaction does not exist', () => {
      it("returns a 404 'not found' response", async () => {
        const id = GeneralHelper.uuid4()
        const response = await server.inject(options(id, authToken))

        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(404)
        expect(payload.message).to.equal(`No transaction found with id ${id}`)
      })
    })
  })
})
