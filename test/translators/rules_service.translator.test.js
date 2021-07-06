// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import GeneralHelper from '../support/helpers/general.helper.js'

// Thing under test
import RulesServiceTranslator from '../../app/translators/rules_service.translator.js'

// Fixtures
import * as fixtures from '../../support/fixtures/fixtures.js'
const chargeFixtures = fixtures.calculateCharge

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Rules Service translator', () => {
  let data

  beforeEach(async () => {
    data = GeneralHelper.cloneObject(chargeFixtures.presroc.simple.rulesService)
  })

  describe("the 'chargeValue' property", () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.chargeValue = 123.45

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.chargeValue).to.equal(12345)
    })
  })

  describe("the 'sucFactor' property", () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.sucFactor = 123.45

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr4).to.equal(12345)
    })
  })

  describe("the 'lineAttr10' property", () => {
    it('returns S127 value if present', async () => {
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'
      data.WRLSChargingResponse.s127Agreement = 'S127 x 0.5'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S127 x 0.5')
    })

    it('returns S126 value if it indicates adjustment', async () => {
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 0.5'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal('S126 x 0.5')
    })

    it("returns null if S126 value doesn't indicate adjustment", async () => {
      data.WRLSChargingResponse.abatementAdjustment = 'S126 x 1.0'

      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.lineAttr10).to.equal(null)
    })
  })

  describe("the 'chargeCalculation' property", () => {
    it('returns an exact copy of the response received from the rules service', async => {
      const testTranslator = new RulesServiceTranslator(data)

      expect(testTranslator.chargeCalculation).to.equal(JSON.stringify(data))
    })
  })
})
