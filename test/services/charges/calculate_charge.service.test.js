'use strict'
// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../../support/helpers')
const { presroc: presrocFixtures, sroc: srocFixtures } = require('../../support/fixtures/calculate_charge')
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
    describe('and is a presroc request', () => {
      describe('and is a simple request', () => {
        beforeEach(async () => {
          Sinon.stub(RequestRulesServiceCharge, 'go').returns(presrocFixtures.simple.rulesService)
        })

        it('returns a calculated charge', async () => {
          const result = await CalculateChargeService.go(presrocFixtures.simple.request, regime)

          expect(result.calculation).to.exist()
          expect(result).to.equal(presrocFixtures.simple.response)
        })
      })

      describe('and is a Section 126 Prorata Credit request', () => {
        beforeEach(async () => {
          Sinon.stub(RequestRulesServiceCharge, 'go').returns(presrocFixtures.s126ProrataCredit.rulesService)
        })

        it('returns a calculated charge', async () => {
          const result = await CalculateChargeService.go(presrocFixtures.s126ProrataCredit.request, regime)

          expect(result.calculation).to.exist()
          expect(result).to.equal(presrocFixtures.s126ProrataCredit.response)
        })
      })

      describe('and is a Section Agreements True request', () => {
        beforeEach(async () => {
          Sinon.stub(RequestRulesServiceCharge, 'go').returns(presrocFixtures.sectionAgreementsTrue.rulesService)
        })

        it('returns a calculated charge', async () => {
          const result = await CalculateChargeService.go(presrocFixtures.sectionAgreementsTrue.request, regime)

          expect(result.calculation).to.exist()
          expect(result).to.equal(presrocFixtures.sectionAgreementsTrue.response)
        })
      })
    })

    describe('and is an sroc request', () => {
      describe('and is a simple request', () => {
        beforeEach(async () => {
          Sinon.stub(RequestRulesServiceCharge, 'go').returns(srocFixtures.simple.rulesService)
        })

        it('returns a calculated charge', async () => {
          const result = await CalculateChargeService.go(srocFixtures.simple.request, regime)

          expect(result.calculation).to.exist()
          expect(result).to.equal(srocFixtures.simple.response)
        })
      })
    })
  })

  describe('when the data is invalid', () => {
    it('throws an error', async () => {
      const invalidPaylod = GeneralHelper.cloneObject(presrocFixtures.simple.request)
      invalidPaylod.periodStart = '01-APR-2021'

      const err = await expect(CalculateChargeService.go(invalidPaylod, regime)).to.reject(ValidationError)

      expect(err).to.be.an.error()
    })
  })

  describe("When I don't want a 'presenter response'", () => {
    beforeEach(async () => {
      Sinon.stub(RequestRulesServiceCharge, 'go').returns(presrocFixtures.simple.rulesService)
    })

    it("returns the 'rule service response'", async () => {
      const result = await CalculateChargeService.go(presrocFixtures.simple.request, regime, false)

      expect(result.calculation).to.not.exist()
      expect(result.chargeCalculation).to.exist()
    })
  })
})
