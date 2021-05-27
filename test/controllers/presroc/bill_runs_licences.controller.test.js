'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
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
  LicenceHelper,
  RegimeHelper,
  InvoiceHelper
} = require('../../support/helpers')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')

describe('Presroc Licences controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun
  let invoice
  let licence

  before(async () => {
    server = await deployment()
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()

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
    })

    describe('When the request is valid', () => {
      it('returns a 204 response', async () => {
        const response = await server.inject(options(authToken, billRun.id, licence.id))

        expect(response.statusCode).to.equal(204)
      })
    })

    describe('When the request is invalid', () => {
      describe('because the licence does not exist', () => {
        it('returns error status 404', async () => {
          const response = await server.inject(options(authToken, billRun.id, GeneralHelper.uuid4()))

          expect(response.statusCode).to.equal(404)
        })
      })
    })
  })
})
