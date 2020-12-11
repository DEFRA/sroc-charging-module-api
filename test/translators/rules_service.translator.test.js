'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { WRLSChargingResponse: testResponse } = require('../support/fixtures/wrls/rules_service_response.json')

// Thing under test
const { RulesServiceTranslator } = require('../../app/translators')

describe('Rules Service translator', () => {
  describe('chargeValue', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      const data = {
        ...testResponse,
        chargeValue: 123.45
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: data })

      expect(testTranslator.chargeValue).to.equal(12345)
    })
  })

  describe('lineAttr10', () => {
    it('returns S127 value if present', async () => {
      const data = {
        ...testResponse,
        abatementAdjustment: 'S126 x 0.5',
        s127Agreement: 'S127 x 0.5'
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: data })

      expect(testTranslator.lineAttr10).to.equal('S127 x 0.5')
    })

    it('returns S126 value if it indicates adjustment', async () => {
      const data = {
        ...testResponse,
        abatementAdjustment: 'S126 x 0.5'
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: data })

      expect(testTranslator.lineAttr10).to.equal('S126 x 0.5')
    })

    it("returns null if S126 value doesn't indicate adjustment", async () => {
      const data = {
        ...testResponse,
        abatementAdjustment: 'S126 x 1.0'
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: data })

      expect(testTranslator.lineAttr10).to.equal(null)
    })
  })
})
