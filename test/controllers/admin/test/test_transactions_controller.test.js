// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../../../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../../../support/helpers/database.helper.js'
import GeneralHelper from '../../../support/helpers/general.helper.js'
import TransactionHelper from '../../../support/helpers/transaction.helper.js'

// Things we need to stub
import JsonWebToken from 'jsonwebtoken'

// For running our service
import { init } from '../../../../app/server.js'

// Test framework setup
const { describe, it, before, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

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
