'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code
const { ValidationError } = require('joi')

// Thing under test
const { CalculateChargeTranslator } = require('../../app/translators')

describe.only('Calculate Charge translator', () => {
  const payload = {
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

  const data = (payload, regime = 'wrls') => {
    return {
      regime,
      ...payload
    }
  }

  describe('Default values', () => {
    it("defaults 'section126Factor' to '1.0'", async () => {
      const empty126FactorPayload = {
        ...payload,
        section126Factor: null
      }
      const testTranslator = new CalculateChargeTranslator(data(empty126FactorPayload))

      expect(testTranslator.regimeValue11).to.be.a.number().and.equal(1.0)
    })

    it("defaults 'ruleset' to 'presroc'", async () => {
      const testTranslator = new CalculateChargeTranslator(data(payload))

      expect(testTranslator.ruleset).to.be.a.string().and.equal('presroc')
    })
  })

  describe('calculating prorataDays', () => {
    it('correctly calculates the format', async () => {
      const proraratPayload = {
        ...payload,
        billableDays: 128,
        authorisedDays: 256
      }
      const testTranslator = new CalculateChargeTranslator(data(proraratPayload))

      expect(testTranslator.lineAttr3).to.equal('128/256')
    })

    it('correctly pads values to 3 digits', async () => {
      const proraratPayload = {
        ...payload,
        billableDays: 8,
        authorisedDays: 16
      }
      const testTranslator = new CalculateChargeTranslator(data(proraratPayload))

      expect(testTranslator.lineAttr3).to.equal('008/016')
    })
  })

  describe('calculating the financial year', () => {
    it("correctly determines the previous year for 'period' dates in March or earlier", async () => {
      const financialYearPayload = {
        ...payload,
        periodStart: '01-MAR-2022',
        periodEnd: '30-MAR-2022'
      }
      const testTranslator = new CalculateChargeTranslator(data(financialYearPayload))

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })

    it("correctly determines the current year for 'period' dates in April onwards", async () => {
      const financialYearPayload = {
        ...payload,
        periodStart: '01-APR-2021',
        periodEnd: '01-MAY-2021'
      }
      const testTranslator = new CalculateChargeTranslator(data(financialYearPayload))

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })
  })

  describe('handling of date formats', () => {
    describe("when period start and end are formatted as 'DD-MMM-YYYY'", () => {
      it('parses them correctly', async () => {
        const result = new CalculateChargeTranslator(data(payload))

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2020)
      })
    })

    describe("when period start and end are formatted as 'DD-MM-YYYY'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '01-04-2020',
          periodEnd: '31-03-2021'
        }
        const result = new CalculateChargeTranslator(data(dateFormatPayload))

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2020)
      })
    })

    describe("when period start and end are formatted as 'YYYY-MM-DD'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '2020-04-01',
          periodEnd: '2021-03-31'
        }
        const result = new CalculateChargeTranslator(data(dateFormatPayload))

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2020)
      })
    })

    describe("when period start and end are formatted as 'DD/MM/YYYY'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '01/04/2020',
          periodEnd: '31/03/2021'
        }
        const result = new CalculateChargeTranslator(data(dateFormatPayload))

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2020)
      })
    })

    describe("when period start and end are formatted as 'YYYY/MM/DD'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '2020/04/01',
          periodEnd: '2021/03/31'
        }
        const result = new CalculateChargeTranslator(data(dateFormatPayload))

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2020)
      })
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new CalculateChargeTranslator(data(payload))

        expect(result).to.not.be.an.error()
      })

      describe.only("if 'compensationCharge' is true", () => {
        describe("and 'eiucSource' is missing", () => {
          it('still does not throw an error', async () => {
            const validPayload = {
              ...payload,
              compensationCharge: false
            }
            delete validPayload.eiucSource

            const result = new CalculateChargeTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })
        })
      })
    })

    describe('when the data is not valid', () => {
      describe("because the 'periodStart' is greater than the 'periodEnd'", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            periodStart: '01-APR-2021'
          }

          expect(() => new CalculateChargeTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because the 'periodEnd' is less than 01-APR-2014", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            periodStart: '01-FEB-2014',
            periodEnd: '01-MAR-2014'
          }

          expect(() => new CalculateChargeTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because 'compensationCharge' is true", () => {
        describe("and 'eiucSource' is empty", () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              compensationCharge: true,
              eiucSource: ''
            }

            expect(() => new CalculateChargeTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe("because 'periodStart' and 'periodEnd' are not in the same financial year", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            periodStart: '01-APR-2021',
            periodEnd: '01-APR-2022'
          }

          expect(() => new CalculateChargeTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })
    })
  })
})
