// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../../support/helpers/database.helper.js'
import RegimeHelper from '../../support/helpers/regime.helper.js'

// Things we need to stub
import AdminSendTransactionFileService from '../../../app/services/admin_send_transaction_file.service.js'
import JsonWebToken from 'jsonwebtoken'

// For running our service
import { init } from '../../../app/server.js'

// Test framework setup
const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

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
