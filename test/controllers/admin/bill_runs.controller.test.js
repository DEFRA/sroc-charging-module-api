'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
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
const { SendTransactionFileService } = require('../../../app/services')

describe('Presroc Bill Runs controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun
  let sendStub

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

    sendStub = Sinon.stub(SendTransactionFileService, 'go')
  })

  after(async () => {
    Sinon.restore()
  })

  afterEach(async () => {
    sendStub.restore()
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
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'pending')
    })

    describe('When the request is valid', () => {
      it('returns success status 204', async () => {
        const response = await server.inject(options(authToken, billRun.id))

        expect(response.statusCode).to.equal(204)
      })

      it('calls SendTransactionFileService with the regime and bill run', async () => {
        await server.inject(options(authToken, billRun.id))

        expect(sendStub.calledOnce).to.be.true()
        expect(sendStub.getCall(0).args[0].id).to.equal(regime.id)
        expect(sendStub.getCall(0).args[1].id).to.equal(billRun.id)
      })
    })
  })
})
