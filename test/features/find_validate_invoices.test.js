// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import AuthorisationHelper from '../support/helpers/authorisation.helper.js'
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import InvoiceHelper from '../support/helpers/invoice.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import RouteHelper from '../support/helpers/route.helper.js'
import SequenceCounterHelper from '../support/helpers/sequence_counter.helper.js'

// Things we need to stub
import JsonWebToken from 'jsonwebtoken'

// For running our service
import { init } from '../../app/server.js'

// Test framework setup
const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Finding and validating invoices in requests', () => {
  let server
  let invoice
  let authToken
  const nonAdminClientId = '1234546789'

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    const regime = await RegimeHelper.addRegime('wrls', 'Water')

    await AuthorisedSystemHelper.addSystem(nonAdminClientId, 'system', [regime])

    await SequenceCounterHelper.addSequenceCounter(regime.id, 'A')
    const billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)
    invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER', '2021')

    RouteHelper.addRequestAppCheckRoute(server, 'invoice')
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When the route is for an invoice', () => {
    beforeEach(async () => {
      authToken = AuthorisationHelper.nonAdminToken(nonAdminClientId)

      Sinon
        .stub(JsonWebToken, 'verify')
        .returns(AuthorisationHelper.decodeToken(authToken))
    })

    describe('and the request is valid', () => {
      const options = id => {
        return {
          method: 'GET',
          url: `/test/wrls/invoices/${id}`,
          headers: { authorization: `Bearer ${authToken}` }
        }
      }

      it('adds the matching invoice to the request', async () => {
        const response = await server.inject(options(invoice.id))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload.id).to.equal(invoice.id)
      })
    })

    describe('but the request is invalid', () => {
      const options = id => {
        return {
          method: 'GET',
          url: `/test/wrls/invoices/${id}`,
          headers: { authorization: `Bearer ${authToken}` }
        }
      }

      it('rejects the request with the appropriate error message', async () => {
        const unknownInvoiceId = GeneralHelper.uuid4()

        const response = await server.inject(options(unknownInvoiceId))
        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(404)
        expect(responsePayload.message).to.equal(`Invoice ${unknownInvoiceId} is unknown.`)
      })
    })
  })
})
