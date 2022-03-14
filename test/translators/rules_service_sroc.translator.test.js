'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GeneralHelper = require('../support/helpers/general.helper')
const rulesServiceFixture = require('../support/fixtures/calculate_charge/sroc/simple_rules_service.json')

// Thing under test
const RulesServiceSrocTranslator = require('../../app/translators/rules_service_sroc.translator')

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

  describe('the headerAttr9 property', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.baselineCharge = 123.45

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.headerAttr9).to.equal(12345)
    })
  })

  describe('the headerAttr10 property', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.waterCompanyCharge = 123.45

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.headerAttr10).to.equal(12345)
    })
  })

  describe('the lineAttr11 property', () => {
    it('is translated to pence instead of pounds and pence', async () => {
      data.WRLSChargingResponse.supportedSourceCharge = 123.45

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.lineAttr11).to.equal(12345)
    })
  })

  describe('the lineAttr12 property', () => {
    it('returns the factor value when specified', async () => {
      data.WRLSChargingResponse.winterOnlyAdjustment = 'Winter Only Discount 0.5'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.lineAttr12).to.equal(0.5)
    })

    it('returns `null` if the Rules Service returned `null`', async () => {
      data.WRLSChargingResponse.winterOnlyAdjustment = null

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.lineAttr12).to.equal(null)
    })
  })

  describe('the lineAttr9 property', () => {
    it('returns the factor value when specified', async () => {
      data.WRLSChargingResponse.s130Agreement = 'CRT 0.5'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.lineAttr9).to.equal(0.5)
    })

    it('returns `null` if the Rules Service returned `null`', async () => {
      data.WRLSChargingResponse.s130Agreement = null

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.lineAttr9).to.equal(null)
    })
  })

  describe('the lineAttr15 property', () => {
    it('returns the factor value when specified', async () => {
      data.WRLSChargingResponse.s127Agreement = 'Two-Part tariff 0.5'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.lineAttr15).to.equal(0.5)
    })

    it('returns `null` if the Rules Service returned `null`', async () => {
      data.WRLSChargingResponse.s127Agreement = null

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.lineAttr15).to.equal(null)
    })
  })

  describe('the regimeValue2 property', () => {
    it('returns the percentage as a number', async () => {
      data.WRLSChargingResponse.compensationChargePercentage = '50%'

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.regimeValue2).to.equal(50)
    })

    it('returns `null` if the Rules Service returned `null`', async () => {
      data.WRLSChargingResponse.compensationChargePercentage = null

      const testTranslator = new RulesServiceSrocTranslator(data)

      expect(testTranslator.regimeValue2).to.equal(null)
    })
  })
})
