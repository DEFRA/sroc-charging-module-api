'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { ChargeTranslator } = require('../../app/translators')

describe('Charge translator', () => {
  describe('prorata days', () => {
    it('are correctly calculated', async () => {
      const testData = { billableDays: 128, authorisedDays: 256 }
      const testTranslator = new ChargeTranslator(testData)

      expect(testTranslator.lineAttr3).to.equal('128/256')
    })

    it('are correctly padded to 3 digits', async () => {
      const testData = { billableDays: 8, authorisedDays: 16 }
      const testTranslator = new ChargeTranslator(testData)

      expect(testTranslator.lineAttr3).to.equal('008/016')
    })
  })

  describe('financial year', () => {
    it('is the previous year for dates in March or earlier', async () => {
      const testData = { periodStart: '01-MAR-2020' }
      const testTranslator = new ChargeTranslator(testData)

      expect(testTranslator.chargeFinancialYear).to.equal(2019)
    })

    it('is the current year for dates in April onwards', async () => {
      const testData = { periodStart: '01-APR-2020' }
      const testTranslator = new ChargeTranslator(testData)

      expect(testTranslator.chargeFinancialYear).to.equal(2020)
    })
  })
})
