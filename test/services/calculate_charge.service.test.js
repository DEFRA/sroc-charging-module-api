// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import GeneralHelper from '../support/helpers/general.helper.js'

// Things we need to stub
import RulesService from '../../app/services/rules.service.js'

// Additional dependencies needed
import { ValidationError } from 'joi'

// Thing under test
import CalculateChargeService from '../../app/services/calculate_charge.service.js'

// Fixtures
import * as fixtures from '../support/fixtures/fixtures.js'
const chargeFixtures = fixtures.calculateCharge

// Test framework setup
const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
        Sinon.stub(RulesService, 'go').returns(chargeFixtures.presroc.simple.rulesService)
      })

      it('returns a calculated charge', async () => {
        const result = await CalculateChargeService.go(chargeFixtures.presroc.simple.request, regime)

        expect(result.calculation).to.exist()
        expect(result).to.equal(chargeFixtures.presroc.simple.response)
      })
    })

    describe("and is a 'Section 126 prorata credit' request", () => {
      beforeEach(async () => {
        Sinon.stub(RulesService, 'go').returns(chargeFixtures.presroc.s126ProrataCredit.rulesService)
      })

      it('returns a calculated charge', async () => {
        const result = await CalculateChargeService.go(chargeFixtures.presroc.s126ProrataCredit.request, regime)

        expect(result.calculation).to.exist()
        expect(result).to.equal(chargeFixtures.presroc.s126ProrataCredit.response)
      })
    })

    describe("and is a 'Section agreements true' request", () => {
      beforeEach(async () => {
        Sinon.stub(RulesService, 'go').returns(chargeFixtures.presroc.sectionAgreementsTrue.rulesService)
      })

      it('returns a calculated charge', async () => {
        const result = await CalculateChargeService.go(chargeFixtures.presroc.sectionAgreementsTrue.request, regime)

        expect(result.calculation).to.exist()
        expect(result).to.equal(chargeFixtures.presroc.sectionAgreementsTrue.response)
      })
    })
  })

  describe('when the data is invalid', () => {
    it('throws an error', async () => {
      const invalidPaylod = GeneralHelper.cloneObject(chargeFixtures.presroc.simple.request)
      invalidPaylod.periodStart = '01-APR-2021'

      const err = await expect(CalculateChargeService.go(invalidPaylod, regime)).to.reject(ValidationError)

      expect(err).to.be.an.error()
    })
  })

  describe("When I don't want a 'presenter response'", () => {
    beforeEach(async () => {
      Sinon.stub(RulesService, 'go').returns(chargeFixtures.presroc.simple.rulesService)
    })

    it("returns the 'rule service response'", async () => {
      const result = await CalculateChargeService.go(chargeFixtures.presroc.simple.request, regime, false)

      expect(result.calculation).to.not.exist()
      expect(result.chargeCalculation).to.exist()
    })
  })
})
