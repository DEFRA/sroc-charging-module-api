'use strict'
// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { presroc: fixtures } = require('../support/fixtures/calculate_charge')

// Things we need to stub
const { RulesService } = require('../../app/services')

// Thing under test
const { CalculateChargeService } = require('../../app/services')

describe('Calculate Charge service', () => {
  describe('When the data is valid', () => {
    describe("is for the 'WRLS' regime", () => {
      // We don't need an actual regime record for the calculate charge service as nowhere in its logic do we need an
      // ID
      const regime = {
        slug: 'wrls'
      }

      afterEach(async () => {
        Sinon.restore()
      })

      describe("and is a 'simple' request", () => {
        beforeEach(async () => {
          Sinon.stub(RulesService, 'go').returns(fixtures.simple.rulesService)
        })

        it('returns a calculated charge', async () => {
          const result = await CalculateChargeService.go(fixtures.simple.request, regime)

          expect(result.calculation).to.exist()
          expect(result).to.equal(fixtures.simple.response)
        })
      })

      describe("and is a 'Section 126 prorata credit' request", () => {
        beforeEach(async () => {
          Sinon.stub(RulesService, 'go').returns(fixtures.s126ProrataCredit.rulesService)
        })

        it('returns a calculated charge', async () => {
          const result = await CalculateChargeService.go(fixtures.s126ProrataCredit.request, regime)

          expect(result.calculation).to.exist()
          expect(result).to.equal(fixtures.s126ProrataCredit.response)
        })
      })

      describe("and is a 'Section agreements true' request", () => {
        beforeEach(async () => {
          Sinon.stub(RulesService, 'go').returns(fixtures.sectionAgreementsTrue.rulesService)
        })

        it('returns a calculated charge', async () => {
          const result = await CalculateChargeService.go(fixtures.sectionAgreementsTrue.request, regime)

          expect(result.calculation).to.exist()
          expect(result).to.equal(fixtures.sectionAgreementsTrue.response)
        })
      })
    })
  })
})
