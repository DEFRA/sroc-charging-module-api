'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code
const { ValidationError } = require('joi')

// Test helpers
const testData = require('../support/fixtures/charge.json')

// Thing under test
const { ChargeTranslator } = require('../../app/translators')

describe('Charge translator', () => {
  describe('prorata days', () => {
    it('are correctly calculated', async () => {
      const testTranslator = new ChargeTranslator({
        ...testData,
        billableDays: 128,
        authorisedDays: 256
      })

      expect(testTranslator.lineAttr3).to.equal('128/256')
    })

    it('are correctly padded to 3 digits', async () => {
      const testTranslator = new ChargeTranslator({
        ...testData,
        billableDays: 8,
        authorisedDays: 16
      })

      expect(testTranslator.lineAttr3).to.equal('008/016')
    })
  })

  describe('financial year', () => {
    it('is the previous year for start dates in March or earlier', async () => {
      const testTranslator = new ChargeTranslator({
        ...testData,
        periodStart: '01-MAR-2022'
      })

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })

    it('is the current year for start dates in April onwards', async () => {
      const testTranslator = new ChargeTranslator({
        ...testData,
        periodStart: '01-APR-2021'
      })

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })

    it('must be the same for the start and end dates', async () => {
      const invalidDates = {
        ...testData,
        periodStart: '01-APR-2021',
        periodEnd: '01-APR-2022'
      }

      expect(() => new ChargeTranslator(invalidDates)).to.throw(ValidationError)
    })
  })
})
