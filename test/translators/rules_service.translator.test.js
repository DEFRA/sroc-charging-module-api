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
  describe('baselineCharge', () => {
    it('is correctly returned', async () => {
      const testData = {
        ...testResponse,
        decisionPoints: {
          baselineCharge: 123.45
        }
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: testData })

      expect(testTranslator.baselineCharge).to.equal(12345)
    })
  })

  describe('chargeValue', () => {
    it('is correctly returned', async () => {
      const testData = {
        ...testResponse,
        chargeValue: 123.45
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: testData })

      expect(testTranslator.chargeValue).to.equal(12345)
    })
  })

  describe('lineAttr10', () => {
    it('returns S127 value if present', async () => {
      const testData = {
        ...testResponse,
        abatementAdjustment: 'S126 x 0.5',
        s127Agreement: 'S127 x 0.5'
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: testData })

      expect(testTranslator.lineAttr10).to.equal('S127 x 0.5')
    })

    it('returns S126 value if it indicates adjustment', async () => {
      const testData = {
        ...testResponse,
        abatementAdjustment: 'S126 x 0.5'
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: testData })

      expect(testTranslator.lineAttr10).to.equal('S126 x 0.5')
    })

    it('returns null if S126 value doesn\'t indicate adjustment', async () => {
      const testData = {
        ...testResponse,
        abatementAdjustment: 'S126 x 1.0'
      }

      const testTranslator = new RulesServiceTranslator({ WRLSChargingResponse: testData })

      expect(testTranslator.lineAttr10).to.equal(null)
    })
  })
})
