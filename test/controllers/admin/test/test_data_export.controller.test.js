'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../../app/server')

// Test helpers
const AuthorisationHelper = require('../../../support/helpers/authorisation.helper')
const AuthorisedSystemHelper = require('../../../support/helpers/authorised_system.helper')
const DatabaseHelper = require('../../../support/helpers/database.helper')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const ExportDataFiles = require('../../../../app/services/files/exports/export_data_files.service')

describe('Test data export controller', () => {
  let server
  let authToken

  before(async () => {
    authToken = AuthorisationHelper.adminToken()
  })

  beforeEach(async () => {
    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))

    await DatabaseHelper.clean()
    server = await init()

    await AuthorisedSystemHelper.addAdminSystem()
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('Test data export: PATCH /admin/test/data-export', () => {
    let response
    let dataExportStub

    const options = (token) => {
      return {
        method: 'PATCH',
        url: '/admin/test/data-export',
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When exporting suceeds', () => {
      beforeEach(async () => {
        dataExportStub = Sinon.stub(ExportDataFiles, 'go').returns(true)
        response = await server.inject(options(authToken))
      })

      it('returns a 204 response', async () => {
        expect(response.statusCode).to.equal(204)
      })

      it('calls the ExportDataFiles', async () => {
        expect(dataExportStub.calledOnce).to.be.true()
      })
    })

    describe('When exporting fails', () => {
      beforeEach(async () => {
        dataExportStub = Sinon.stub(ExportDataFiles, 'go').returns(false)
        response = await server.inject(options(authToken))
      })

      it('returns a 400 response', async () => {
        expect(response.statusCode).to.equal(400)
      })
    })
  })
})
