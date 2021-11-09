'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')
const rulesServiceFixture = require('../support/fixtures/calculate_charge/sroc/simple_rules_service.json')

// Thing under test
const { RulesServiceSrocTranslator } = require('../../app/translators')

describe('Rules Service Sroc translator', () => {
  let data

  beforeEach(async () => {
    data = GeneralHelper.cloneObject(rulesServiceFixture)
  })

  describe('the chargeValue property', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.chargeValue = 123.45

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.chargeValue).to.equal(12345)
    })
  })

  describe('the baseCharge property', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.baselineCharge = 123.45

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.baseCharge).to.equal(12345)
    })
  })

  describe('the waterCompanyChargeValue property', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.waterCompanyCharge = 123.45

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.waterCompanyChargeValue).to.equal(12345)
    })
  })

  describe('the supportedSourceValue property', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.supportedSourceCharge = 123.45

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.supportedSourceValue).to.equal(12345)
    })
  })

  describe('the winterOnlyFactor property', () => {
    it('returns the factor value when specified', async () => {
      data.WRLSChargingResponse.winterOnlyAdjustment = 'Winter Only Discount 0.5'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.winterOnlyFactor).to.equal(0.5)
    })

    it('returns `null` if the Rules Service returned `null`', async () => {
      data.WRLSChargingResponse.winterOnlyAdjustment = null

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.winterOnlyFactor).to.equal(null)
    })
  })

  describe('the section130Factor property', () => {
    it('returns the factor value when specified', async () => {
      data.WRLSChargingResponse.s130Agreement = 'CRT 0.5'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.section130Factor).to.equal(0.5)
    })

    it('returns `null` if the Rules Service returned `null`', async () => {
      data.WRLSChargingResponse.s130Agreement = null

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.section130Factor).to.equal(null)
    })
  })

  describe('the section127Factor property', () => {
    it('returns the factor value when specified', async () => {
      data.WRLSChargingResponse.s127Agreement = 'Two-Part tariff 0.5'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.section127Factor).to.equal(0.5)
    })

    it('returns `null` if the Rules Service returned `null`', async () => {
      data.WRLSChargingResponse.s127Agreement = null

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.section127Factor).to.equal(null)
    })
  })

  describe('the compensationChargePercent property', () => {
    it('returns the percentage as a number', async () => {
      data.WRLSChargingResponse.compensationChargePercentage = '50%'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.compensationChargePercent).to.equal(50)
    })
  })
})
