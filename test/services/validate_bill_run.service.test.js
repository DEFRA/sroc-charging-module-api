'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper
} = require('../support/helpers')

const { CreateTransactionService } = require('../../app/services')

const { presroc: requestFixtures } = require('../support/fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../support/fixtures/calculate_charge')

const { rulesService: rulesServiceResponse } = chargeFixtures.simple

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { ValidateBillRunService } = require('../../app/services')

describe('Validate Bill Run Summary service', () => {
  let billRun
  let authorisedSystem
  let regime
  let payload

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])

    // We clone the request fixture as our payload so we have it available for modification in the invalid tests. For
    // the valid tests we can use it straight as
    payload = GeneralHelper.cloneObject(requestFixtures.simple)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      Sinon.stub(RulesService, 'go').returns(rulesServiceResponse)
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    })

    it('returns true', async () => {
      await CreateTransactionService.go(payload, billRun.id, authorisedSystem, regime)

      const result = await ValidateBillRunService.go(billRun.id)

      expect(result).to.equal(true)
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    describe('because no matching bill run exists', () => {
      it('throws an error', async () => {
        const unknownBillRunId = GeneralHelper.uuid4()

        const err = await expect(ValidateBillRunService.go(unknownBillRunId)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
      })
    })

    describe('because the bill run is already generating', () => {
      it('throws an error', async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'generating')
        const err = await expect(ValidateBillRunService.go(generatingBillRun.id)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${generatingBillRun.id} is already being generated`)
      })
    })

    describe('because the bill run is not editable', () => {
      it('throws an error', async () => {
        const notEditableStatus = 'NOT_EDITABLE'
        const notEditableBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', notEditableStatus)
        const err = await expect(ValidateBillRunService.go(notEditableBillRun.id)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${notEditableBillRun.id} cannot be edited because its status is ${notEditableStatus}.`)
      })
    })
  })
})
