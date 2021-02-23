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
const { GenerateBillRunValidationService } = require('../../app/services')

describe('Generate Bill Run Validation service', () => {
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

      const result = await GenerateBillRunValidationService.go(billRun)

      expect(result).to.equal(true)
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    describe('because the bill run is already generating', () => {
      it('throws an error', async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'generating')
        const err = await expect(GenerateBillRunValidationService.go(generatingBillRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${generatingBillRun.id} is already being generated`)
      })
    })

    describe('because the bill run is empty', () => {
      it('throws an error', async () => {
        const emptyBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A')
        const err = await expect(GenerateBillRunValidationService.go(emptyBillRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${emptyBillRun.id} cannot be generated because it has no transactions.`)
      })
    })
  })
})
