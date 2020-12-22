'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')
const rulesServiceFixture = require('../support/fixtures/calculate_charge/presroc/simple_rules_service.json')

// Thing under test
const { RulesServiceTranslator } = require('../../app/translators')

describe('Rules Service translator', () => {
  describe("the 'chargeValue' property", () => {
    it('is translated to pence instead of pounds and pence', async () => {
      const data = GeneralHelper.cloneObject(rulesServiceFixture)
      data.WRLSChargingResponse.chargeValue = 123.45

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.chargeValue).to.equal(12345)
    })
  })

  describe("the 'lineAttr10' property", () => {
    it('returns S127 value if present', async () => {
      const data = GeneralHelper.cloneObject(rulesServiceFixture)
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'
      data.WRLSChargingResponse.s127Agreement = 'S127 x 0.5'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S127 x 0.5')
    })

    it('returns S126 value if it indicates adjustment', async () => {
      const data = GeneralHelper.cloneObject(rulesServiceFixture)
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S126 x 0.5')
    })

    it("returns null if S126 value doesn't indicate adjustment", async () => {
      const data = GeneralHelper.cloneObject(rulesServiceFixture)
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 1.0'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal(null)
    })
  })

  describe("the 'chargeCalculation' property", () => {
    it.only('returns an exact copy of the response received from the rules service', async => {
      const data = GeneralHelper.cloneObject(rulesServiceFixture)

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.chargeCalculation).to.equal(JSON.stringify(data))
    })
  })
})
