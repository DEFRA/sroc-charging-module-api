'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../../app/server')

// Test helpers
const AuthorisationHelper = require('../../../support/helpers/authorisation.helper.js')
const AuthorisedSystemHelper = require('../../../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const GeneralHelper = require('../../../support/helpers/general.helper.js')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const TestListCustomerFilesService = require('../../../../app/services/files/customers/test_list_customer_files.service.js')
const ViewCustomerFileService = require('../../../../app/services/files/customers/view_customer_file.service.js')

describe('Test customer files controller', () => {
  let server
  let authToken
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    authToken = AuthorisationHelper.adminToken()

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))

    const authSystem = await AuthorisedSystemHelper.addAdminSystem()
    const regimes = await authSystem.$relatedQuery('regimes')
    regime = regimes.filter(r => r.slug === 'wrls')[0]
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('Listing customer files: GET /admin/test/customer-files', () => {
    const options = (regime, token) => {
      return {
        method: 'GET',
        url: `/admin/test/${regime.slug}/customer-files`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    describe('When there are customer files', () => {
      beforeEach(async () => {
        Sinon.stub(TestListCustomerFilesService, 'go').returns([
          {
            id: GeneralHelper.uuid4(),
            regimeId: regime.id,
            region: 'A',
            fileReference: 'nalac50001',
            status: 'exported'
          },
          {
            id: GeneralHelper.uuid4(),
            regimeId: regime.id,
            region: 'A',
            fileReference: 'nalac50002',
            status: 'pending'
          }
        ])
      })

      it('returns a list of customer files', async () => {
        const response = await server.inject(options(regime, authToken))

        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload.length).to.equal(2)
        expect(payload[1].fileReference).to.equal('nalac50002')
      })
    })
  })

  describe('View customer file: GET /admin/test/customer-files/{id}', () => {
    let customerFileId
    const options = (id, token) => {
      return {
        method: 'GET',
        url: `/admin/test/customer-files/${id}`,
        headers: { authorization: `Bearer ${token}` }
      }
    }

    beforeEach(async () => {
      customerFileId = GeneralHelper.uuid4()
    })

    describe('When the customer file exists', () => {
      beforeEach(async () => {
        Sinon.stub(ViewCustomerFileService, 'go').returns({
          id: customerFileId,
          regimeId: regime.id,
          region: 'A',
          fileReference: 'nalac50001',
          status: 'exported',
          exportedCustomers: [
            { id: GeneralHelper.uuid4(), customerReference: 'AA02BEEB', customerFileId },
            { id: GeneralHelper.uuid4(), customerReference: 'BB02BEEB', customerFileId }
          ]
        })
      })

      it('returns the matching customer file', async () => {
        const response = await server.inject(options(customerFileId, authToken))
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload.fileReference).to.equal('nalac50001')
      })
    })

    describe('When the customer file does not exist', () => {
      it("returns a 404 'not found' response", async () => {
        const response = await server.inject(options(customerFileId, authToken))

        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(404)
        expect(payload.message).to.equal(`No customer file found with id ${customerFileId}`)
      })
    })
  })
})
