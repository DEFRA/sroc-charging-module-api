'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const rulesServiceFixture = require('../support/fixtures/calculate_charge/wrls/simple_rules_service.json')

// Thing under test
const { RulesServiceTranslator } = require('../../app/translators')

// Assigning an object is by reference so we need to clone the fixture to allow us to alter it in each test.
// Because the fixture is multi level we can't use the spread operator or Object.assign as these only do shallow
// clones. Using JSON.parse & JSON.stringify is a quick way of doing a deep clone, though not advised for large
// objects
// https://www.samanthaming.com/tidbits/70-3-ways-to-clone-objects/
const cloneFixture = () => {
  return JSON.parse(JSON.stringify(rulesServiceFixture))
}

describe('Rules Service translator', () => {
  describe("the 'chargeValue' property", () => {
    it('is translated to pence instead of pounds and pence', async () => {
      const data = cloneFixture()
      data.WRLSChargingResponse.chargeValue = 123.45

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.chargeValue).to.equal(12345)
    })
  })

  describe("the 'lineAttr10' property", () => {
    it('returns S127 value if present', async () => {
      const data = cloneFixture()
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'
      data.WRLSChargingResponse.s127Agreement = 'S127 x 0.5'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S127 x 0.5')
    })

    it('returns S126 value if it indicates adjustment', async () => {
      const data = cloneFixture()
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S126 x 0.5')
    })

    it("returns null if S126 value doesn't indicate adjustment", async () => {
      const data = cloneFixture()
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 1.0'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal(null)
    })
  })
})
