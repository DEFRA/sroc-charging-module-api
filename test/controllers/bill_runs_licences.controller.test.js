'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const AuthorisationHelper = require('../support/helpers/authorisation.helper.js')
const AuthorisedSystemHelper = require('../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const GeneralHelper = require('../support/helpers/general.helper.js')
const NewLicenceHelper = require('../support/helpers/new_licence.helper.js')
const RegimeHelper = require('../support/helpers/regime.helper.js')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const DeleteLicenceService = require('../../app/services/licences/delete_licence.service.js')
const ValidateBillRunLicenceService = require('../../app/services/licences/validate_bill_run_licence.service.js')
const BillRunModel = require('../../app/models/bill_run.model.js')

describe('Licences controller', () => {
  let server
  let authToken
  let billRun
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await AuthorisedSystemHelper.addSystem('clientId', 'system1', [regime])

    licence = await NewLicenceHelper.create()
    billRun = await BillRunModel.query().findById(licence.billRunId)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  for (const version of ['v2', 'v3']) {
    describe(`Delete a licence: DELETE /${version}/{regimeSlug}/bill-runs/{billRunId}/licences/{licenceId}`, () => {
      let validationStub
      let deletionStub

      const options = (token, billRunId, licenceId) => {
        return {
          method: 'DELETE',
          url: `/${version}/wrls/bill-runs/${billRunId}/licences/${licenceId}`,
          headers: { authorization: `Bearer ${token}` }
        }
      }

      beforeEach(async () => {
        authToken = AuthorisationHelper.nonAdminToken('clientId')

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
          expect(validationStub.firstCall.args[0]).to.equal(billRun.id)
          expect(validationStub.firstCall.args[1]).to.equal(licence)
        })

        it('calls the licence deletion service', async () => {
          await server.inject(options(authToken, billRun.id, licence.id))

          expect(deletionStub.calledOnce).to.be.true()
          expect(deletionStub.firstCall.args[0]).to.equal(licence)
          expect(deletionStub.firstCall.args[1]).to.equal(billRun)
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
  }
})
