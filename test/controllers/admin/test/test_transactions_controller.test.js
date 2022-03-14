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
const AuthorisationHelper = require('../../../support/helpers/authorisation.helper')
const AuthorisedSystemHelper = require('../../../support/helpers/authorised_system.helper')
const BillRunHelper = require('../../../support/helpers/bill_run.helper')
const DatabaseHelper = require('../../../support/helpers/database.helper')
const GeneralHelper = require('../../../support/helpers/general.helper')
const TransactionHelper = require('../../../support/helpers/transaction.helper')

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

  describe('View transaction: GET /admin/test/transactions/{id}', () => {
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
