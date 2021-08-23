'use strict'
// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../../support/helpers')
const { presroc: fixtures } = require('../../support/fixtures/calculate_charge')
const { ValidationError } = require('joi')

// Things we need to stub
const { RequestRulesServiceCharge } = require('../../../app/services')

// Thing under test
const { CalculateChargeService } = require('../../../app/services')

describe('Calculate Charge service', () => {
  // We don't need an actual regime record for the calculate charge service as nowhere in its logic do we need anything
  // but the 'slug'
  const regime = {
    slug: 'wrls'
  }

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When the data is valid', () => {
    describe("and is a 'simple' request", () => {
      beforeEach(async () => {
        Sinon.stub(RequestRulesServiceCharge, 'go').returns(fixtures.simple.rulesService)
      })

      it('returns a calculated charge', async () => {
        const result = await CalculateChargeService.go(fixtures.simple.request, regime)

        expect(result.calculation).to.exist()
        expect(result).to.equal(fixtures.simple.response)
      })
    })

    describe("and is a 'Section 126 prorata credit' request", () => {
      beforeEach(async () => {
        Sinon.stub(RequestRulesServiceCharge, 'go').returns(fixtures.s126ProrataCredit.rulesService)
      })

      it('returns a calculated charge', async () => {
        const result = await CalculateChargeService.go(fixtures.s126ProrataCredit.request, regime)

        expect(result.calculation).to.exist()
        expect(result).to.equal(fixtures.s126ProrataCredit.response)
      })
    })

    describe("and is a 'Section agreements true' request", () => {
      beforeEach(async () => {
        Sinon.stub(RequestRulesServiceCharge, 'go').returns(fixtures.sectionAgreementsTrue.rulesService)
      })

      it('returns a calculated charge', async () => {
        const result = await CalculateChargeService.go(fixtures.sectionAgreementsTrue.request, regime)

        expect(result.calculation).to.exist()
        expect(result).to.equal(fixtures.sectionAgreementsTrue.response)
      })
    })
  })

  describe('when the data is invalid', () => {
    it('throws an error', async () => {
      const invalidPaylod = GeneralHelper.cloneObject(fixtures.simple.request)
      invalidPaylod.periodStart = '01-APR-2021'

      const err = await expect(CalculateChargeService.go(invalidPaylod, regime)).to.reject(ValidationError)

      expect(err).to.be.an.error()
    })
  })

  describe("When I don't want a 'presenter response'", () => {
    beforeEach(async () => {
      Sinon.stub(RequestRulesServiceCharge, 'go').returns(fixtures.simple.rulesService)
    })

    it("returns the 'rule service response'", async () => {
      const result = await CalculateChargeService.go(fixtures.simple.request, regime, false)

      expect(result.calculation).to.not.exist()
      expect(result.chargeCalculation).to.exist()
    })
  })
})
