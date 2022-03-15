'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Nock = require('nock')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server')

// Test helpers
const AuthorisationHelper = require('../support/helpers/authorisation.helper.js')
const AuthorisedSystemHelper = require('../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const GeneralHelper = require('../support/helpers/general.helper.js')
const NewBillRunHelper = require('../support/helpers/new_bill_run.helper.js')
const RegimeHelper = require('../support/helpers/regime.helper.js')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')

// Things we need to stub
const JsonWebToken = require('jsonwebtoken')
const CreateTransactionService = require('../../app/services/transactions/create_transaction.service.js')
const CreateTransactionV2GuardService = require('../../app/services/guards/create_transaction_v2_guard.service.js')
const ValidateBillRunRegion = require('../../app/services/bill_runs/validate_bill_run_region.service.js')

describe('Bill runs transactions controller', () => {
  const clientID = '1234546789'
  let server
  let authToken
  let regime
  let authorisedSystem
  let billRun

  before(async () => {
    authToken = AuthorisationHelper.nonAdminToken(clientID)

    Sinon
      .stub(JsonWebToken, 'verify')
      .returns(AuthorisationHelper.decodeToken(authToken))
  })

  beforeEach(async () => {
    await DatabaseHelper.clean()
    server = await init()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem(clientID, 'system1', [regime])
    billRun = await NewBillRunHelper.create(authorisedSystem.id, regime.id)
  })

  after(async () => {
    Sinon.restore()
    Nock.cleanAll()
  })

  describe('Create a bill run transaction: POST /v2/{regimeSlug}/bill-runs/{billRunId}/transactions', () => {
    let payload
    let guardStub
    let validateStub
    let createStub

    const options = (token, payload, billRunId) => {
      return {
        method: 'POST',
        url: `/v2/wrls/bill-runs/${billRunId}/transactions`,
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    beforeEach(async () => {
      createStub = Sinon.stub(CreateTransactionService, 'go').returns({
        transaction: {
          id: GeneralHelper.uuid4(),
          clientId: null
        }
      })
      guardStub = Sinon.stub(CreateTransactionV2GuardService, 'go')
      validateStub = Sinon.stub(ValidateBillRunRegion, 'go')

      // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
      // the valid tests we can use it straight as
      payload = GeneralHelper.cloneObject(requestFixtures.simple)
    })

    afterEach(async () => {
      createStub.restore()
      guardStub.restore()
      validateStub.restore()
    })

    it('passes the bill run to CreateTransactionV2GuardService', async () => {
      await server.inject(options(authToken, payload, billRun.id))

      expect(guardStub.calledOnceWith(billRun)).to.be.true()
    })

    it('validates the request bill run and region', async () => {
      await server.inject(options(authToken, payload, billRun.id))

      expect(validateStub.calledOnceWith(billRun, payload.region)).to.be.true()
    })

    it('calls CreateTransactionService with the appropriate arguments', async () => {
      await server.inject(options(authToken, payload, billRun.id))

      // createStub.calledOnceWith() doesn't work here for some reason! So we check the args individually
      expect(createStub.calledOnce).to.be.true()
      expect(createStub.firstCall.args).to.include(regime)
      expect(createStub.firstCall.args).to.include(billRun)

      // We can't directly check that args includes payload as its empty fields were stripped when we made the request
      expect(createStub.firstCall.firstArg.customerReference).to.equal(payload.customerReference)

      // We can't directly check that args includes authorisedSystem as the instance we have includes the `regimes`
      // array that isn't present in req.auth.credentials.user
      expect(createStub.firstCall.args[2].id).to.equal(authorisedSystem.id)
    })

    it('returns the id of the new transaction', async () => {
      const response = await server.inject(options(authToken, payload, billRun.id))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(201)
      expect(responsePayload.transaction.id).to.exist()
    })
  })

  describe('Create a bill run transaction: POST /v3/{regimeSlug}/bill-runs/{billRunId}/transactions', () => {
    let payload
    let validateStub
    let createStub

    const options = (token, payload, billRunId) => {
      return {
        method: 'POST',
        url: `/v3/wrls/bill-runs/${billRunId}/transactions`,
        headers: { authorization: `Bearer ${token}` },
        payload: payload
      }
    }

    beforeEach(async () => {
      createStub = Sinon.stub(CreateTransactionService, 'go').returns({
        transaction: {
          id: GeneralHelper.uuid4(),
          clientId: null
        }
      })
      validateStub = Sinon.stub(ValidateBillRunRegion, 'go')

      // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
      // the valid tests we can use it straight as
      payload = GeneralHelper.cloneObject(requestFixtures.simple)
    })

    afterEach(async () => {
      createStub.restore()
      validateStub.restore()
    })

    it('validates the request bill run and region', async () => {
      await server.inject(options(authToken, payload, billRun.id))

      expect(validateStub.calledOnceWith(billRun, payload.region)).to.be.true()
    })

    it('calls CreateTransactionService with the appropriate arguments', async () => {
      await server.inject(options(authToken, payload, billRun.id))

      // createStub.calledOnceWith() doesn't work here for some reason! So we check the args individually
      expect(createStub.calledOnce).to.be.true()
      expect(createStub.firstCall.args).to.include(regime)
      expect(createStub.firstCall.args).to.include(billRun)

      // We can't directly check that args includes payload as its empty fields were stripped when we made the request
      expect(createStub.firstCall.firstArg.customerReference).to.equal(payload.customerReference)

      // We can't directly check that args includes authorisedSystem as the instance we have includes the `regimes`
      // array that isn't present in req.auth.credentials.user
      expect(createStub.firstCall.args[2].id).to.equal(authorisedSystem.id)
    })

    it('returns the id of the new transaction', async () => {
      const response = await server.inject(options(authToken, payload, billRun.id))
      const responsePayload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(201)
      expect(responsePayload.transaction.id).to.exist()
    })
  })
})
