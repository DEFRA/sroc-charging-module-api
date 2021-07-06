// Test framework dependencies
import Code from '@hapi/code'
import Lab from '@hapi/lab'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../../../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../../../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../../../support/helpers/database.helper.js'
import GeneralHelper from '../../../support/helpers/general.helper.js'

// Things we need to stub
import JsonWebToken from 'jsonwebtoken'
import ListCustomerFilesService from '../../../../app/services/list_customer_files.service.js'
import ShowCustomerFileService from '../../../../app/services/show_customer_file.service.js'

// For running our service
import { init } from '../../../../app/server.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

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
        Sinon.stub(ListCustomerFilesService, 'go').returns([
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

  describe('Show customer file: GET /admin/test/customer-files/{id}', () => {
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
        Sinon.stub(ShowCustomerFileService, 'go').returns({
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
