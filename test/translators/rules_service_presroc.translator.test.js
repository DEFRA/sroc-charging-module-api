'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GeneralHelper = require('../support/helpers/general.helper.js')
const rulesServiceFixture = require('../support/fixtures/calculate_charge/presroc/simple_rules_service.json')

// Thing under test
const RulesServicePresrocTranslator = require('../../app/translators/rules_service_presroc.translator.js')

describe('Rules Service Presroc translator', () => {
  let data

  beforeEach(async () => {
    data = GeneralHelper.cloneObject(rulesServiceFixture)
  })

  describe("the 'chargeValue' property", () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.chargeValue = 123.45

      const testTranslator = new RulesServicePresrocTranslator(data)

      expect(testTranslator.chargeValue).to.equal(12345)
    })
  })

  describe("the 'sucFactor' property", () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.sucFactor = 123.45

      const testTranslator = new RulesServicePresrocTranslator(data)

      expect(testTranslator.lineAttr4).to.equal(12345)
    })
  })

  describe("the 'lineAttr10' property", () => {
    it('returns S127 value if present', async () => {
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'
      data.WRLSChargingResponse.s127Agreement = 'S127 x 0.5'

      const testTranslator = new RulesServicePresrocTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S127 x 0.5')
    })

    it('returns S126 value if it indicates adjustment', async () => {
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'

      const testTranslator = new RulesServicePresrocTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S126 x 0.5')
    })

    it("returns null if S126 value doesn't indicate adjustment", async () => {
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 1.0'

      const testTranslator = new RulesServicePresrocTranslator(data)

      expect(testTranslator.lineAttr10).to.equal(null)
    })
  })

  describe("the 'chargeCalculation' property", () => {
    it('returns an exact copy of the response received from the rules service', async => {
      const testTranslator = new RulesServicePresrocTranslator(data)

      expect(testTranslator.chargeCalculation).to.equal(JSON.stringify(data))
    })
  })
})
