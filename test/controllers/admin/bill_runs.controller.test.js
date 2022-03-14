'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../app/server')

// Test helpers
const AuthorisationHelper = require('../../support/helpers/authorisation.helper')
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper')
const BillRunHelper = require('../../support/helpers/bill_run.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')
const RegimeHelper = require('../../support/helpers/regime.helper')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const AdminSendTransactionFileService = require('../../../app/services/files/transactions/admin_send_transaction_file.service')

describe('Admin Bill Runs controller', () => {
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun
  let sendStub

  before(async () => {
    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    server = await init()
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addAdminSystem(null, 'admin', 'active', regime)

    sendStub = Sinon.stub(AdminSendTransactionFileService, 'go')
  })

  after(async () => {
    Sinon.restore()
  })

  afterEach(async () => {
    sendStub.restore()
  })

  describe('Send bill run: PATCH /admin/{regimeSlug}/bill-runs/{billRunId}/send', () => {
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
      it('returns success status 201', async () => {
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
