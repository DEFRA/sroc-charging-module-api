'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code
const { ValidationError } = require('joi')

// Thing under test
const { CalculateChargeTranslator } = require('../../app/translators')

describe('Calculate Charge translator', () => {
  const data = {
    periodStart: '01-APR-2020',
    periodEnd: '31-MAR-2021',
    credit: false,
    billableDays: 214,
    authorisedDays: 214,
    volume: '3.5865',
    source: 'Supported',
    season: 'Summer',
    loss: 'Low',
    twoPartTariff: false,
    compensationCharge: false,
    eiucSource: 'Tidal',
    waterUndertaker: false,
    regionalChargingArea: 'Midlands',
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: false
  }

  describe('Default values', () => {
    it("defaults 'section126Factor' to '1.0'", async () => {
      const testTranslator = new CalculateChargeTranslator({
        ...data,
        section126Factor: null
      })

      expect(testTranslator.regimeValue11).to.be.a.number().and.equal(1.0)
    })

    it("defaults 'ruleset' to 'presroc'", async () => {
      const testTranslator = new CalculateChargeTranslator(data)

      expect(testTranslator.ruleset).to.be.a.string().and.equal('presroc')
    })
  })

  describe('calculating prorataDays', () => {
    it('correctly calculates the format', async () => {
      const testTranslator = new CalculateChargeTranslator({
        ...data,
        billableDays: 128,
        authorisedDays: 256
      })

      expect(testTranslator.lineAttr3).to.equal('128/256')
    })

    it('correctly pads values to 3 digits', async () => {
      const testTranslator = new CalculateChargeTranslator({
        ...data,
        billableDays: 8,
        authorisedDays: 16
      })

      expect(testTranslator.lineAttr3).to.equal('008/016')
    })
  })

  describe('calculating the financial year', () => {
    it("correctly determines the previous year for 'period' dates in March or earlier", async () => {
      const testTranslator = new CalculateChargeTranslator({
        ...data,
        periodStart: '01-MAR-2022',
        periodEnd: '30-MAR-2022'
      })

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })

    it("correctly determines the current year for 'period' dates in April onwards", async () => {
      const testTranslator = new CalculateChargeTranslator({
        ...data,
        periodStart: '01-APR-2021',
        periodEnd: '01-MAY-2021'
      })

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        expect(() => new CalculateChargeTranslator(data).to.not.throw())
      })
    })

    describe('when the data is not valid', () => {
      describe("because the 'periodStart' is greater than the 'periodEnd'", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            periodStart: '01-APR-2021'
          }

          expect(() => new CalculateChargeTranslator(invalidData)).to.throw(ValidationError)
        })
      })

      describe("because the 'periodEnd' is less than 01-APR-2014", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            periodStart: '01-FEB-2014',
            periodEnd: '01-MAR-2014'
          }

          expect(() => new CalculateChargeTranslator(invalidData)).to.throw(ValidationError)
        })
      })

      describe("because 'eiucSource' is empty when 'compensationCharge' is true", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            compensationCharge: true,
            eiucSource: ''
          }

          expect(() => new CalculateChargeTranslator(invalidData)).to.throw(ValidationError)
        })
      })

      describe("because 'periodStart' and 'periodEnd' are not in the same financial year", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            periodStart: '01-APR-2021',
            periodEnd: '01-APR-2022'
          }

          expect(() => new CalculateChargeTranslator(invalidData)).to.throw(ValidationError)
        })
      })
    })
  })
})
