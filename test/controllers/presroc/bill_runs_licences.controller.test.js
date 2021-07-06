// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../../support/helpers/database.helper.js'
import GeneralHelper from '../../support/helpers/general.helper.js'
import InvoiceHelper from '../../support/helpers/invoice.helper.js'
import LicenceHelper from '../../support/helpers/licence.helper.js'
import RegimeHelper from '../../support/helpers/regime.helper.js'

// Things we need to stub
import DeleteLicenceService from '../../../app/services/delete_licence.service.js'
import JsonWebToken from 'jsonwebtoken'
import ValidateBillRunLicenceService from '../../../app/services/validate_bill_run_licence.service.js'

// For running our service
import { init } from '../../../app/server.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Presroc Licences controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun
  let invoice
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER', '2020')
    licence = await LicenceHelper.addLicence(billRun.id, 'LICENCE', invoice.id)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('Delete a licence: DELETE /v2/{regimeId}/bill-runs/{billRunId}/licences/{licenceId}', () => {
    let validationStub
    let deletionStub

    const options = (token, billRunId, licenceId) => {
      return {
        method: 'DELETE',
        url: `/v2/wrls/bill-runs/${billRunId}/licences/${licenceId}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    beforeEach(async () => {
      authToken = AuthorisationHelper.nonAdminToken(clientID)

      Sinon
        .stub(JsonWebToken, 'verify')
        .returns(AuthorisationHelper.decodeToken(authToken))

      validationStub = Sinon
        .stub(ValidateBillRunLicenceService, 'go').returns()

      deletionStub = Sinon
        .stub(DeleteLicenceService, 'go').returns()
    })

    afterEach(async () => {
      validationStub.restore()
      deletionStub.restore()
    })

    describe('When the request is valid', () => {
      it('returns a 204 response', async () => {
        const response = await server.inject(options(authToken, billRun.id, licence.id))

        expect(response.statusCode).to.equal(204)
      })

      it('calls the licence validation service', async () => {
        await server.inject(options(authToken, billRun.id, licence.id))

        expect(validationStub.calledOnce).to.be.true()
      })

      it('calls the licence deletion service', async () => {
        await server.inject(options(authToken, billRun.id, licence.id))

        expect(deletionStub.calledOnce).to.be.true()
      })
    })

    describe('When the request is invalid', () => {
      describe('because the licence does not exist', () => {
        it('returns error status 404', async () => {
          const response = await server.inject(options(authToken, billRun.id, GeneralHelper.uuid4()))

          expect(response.statusCode).to.equal(404)
        })

        it('does not call the licence validation service', async () => {
          await server.inject(options(authToken, billRun.id, GeneralHelper.uuid4()))

          expect(validationStub.called).to.be.false()
        })

        it('does not call the licence deletion service', async () => {
          await server.inject(options(authToken, billRun.id, GeneralHelper.uuid4()))

          expect(deletionStub.called).to.be.false()
        })
      })
    })
  })
})
