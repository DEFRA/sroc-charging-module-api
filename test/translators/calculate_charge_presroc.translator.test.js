'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code
const { ValidationError } = require('joi')

// Thing under test
const { CalculateChargePresrocTranslator } = require('../../app/translators')

describe('Calculate Charge Presroc translator', () => {
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
    section130Agreement: false,
    ruleset: 'presroc'
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
      const testTranslator = new CalculateChargePresrocTranslator(data(empty126FactorPayload))

      expect(testTranslator.regimeValue11).to.be.a.number().and.equal(1.0)
    })
  })

  describe('calculating prorataDays', () => {
    it('correctly calculates the format', async () => {
      const proraratPayload = {
        ...payload,
        billableDays: 128,
        authorisedDays: 256
      }
      const testTranslator = new CalculateChargePresrocTranslator(data(proraratPayload))

      expect(testTranslator.lineAttr3).to.equal('128/256')
    })

    it('correctly pads values to 3 digits', async () => {
      const proraratPayload = {
        ...payload,
        billableDays: 8,
        authorisedDays: 16
      }
      const testTranslator = new CalculateChargePresrocTranslator(data(proraratPayload))

      expect(testTranslator.lineAttr3).to.equal('008/016')
    })

    it("correctly uses '000/000' for a 2-part tariff", async () => {
      const proraratPayload = {
        ...payload,
        billableDays: 8,
        authorisedDays: 16,
        section127Agreement: true,
        twoPartTariff: true
      }

      const testTranslator = new CalculateChargePresrocTranslator(data(proraratPayload))

      expect(testTranslator.lineAttr3).to.equal('000/000')
    })
  })

  describe('calculating the financial year', () => {
    it("correctly determines the previous year for 'period' dates in March or earlier", async () => {
      const financialYearPayload = {
        ...payload,
        periodStart: '01-MAR-2022',
        periodEnd: '30-MAR-2022'
      }
      const testTranslator = new CalculateChargePresrocTranslator(data(financialYearPayload))

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })

    it("correctly determines the current year for 'period' dates in April onwards", async () => {
      const financialYearPayload = {
        ...payload,
        periodStart: '01-APR-2021',
        periodEnd: '01-MAY-2021'
      }
      const testTranslator = new CalculateChargePresrocTranslator(data(financialYearPayload))

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })
  })

  describe('handling of date formats', () => {
    describe("when period start and end are formatted as 'DD-MMM-YYYY'", () => {
      it('parses them correctly', async () => {
        const result = new CalculateChargePresrocTranslator(data(payload))

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
        const result = new CalculateChargePresrocTranslator(data(dateFormatPayload))

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
        const result = new CalculateChargePresrocTranslator(data(dateFormatPayload))

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
        const result = new CalculateChargePresrocTranslator(data(dateFormatPayload))

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
        const result = new CalculateChargePresrocTranslator(data(dateFormatPayload))

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2020)
      })
    })
  })

  describe('handling of strings', () => {
    describe('when a valid string is passed to a field that validates against a list', () => {
      it('returns the correct capitalisation of the string', async () => {
        const validPayload = {
          ...payload,
          loss: 'very low',
          source: 'tidAl',
          season: 'ALL YEAR',
          eiucSource: 'oThEr',
          regionalChargingArea: 'sOUTH wEST (Incl wESSEX)'
        }
        const result = new CalculateChargePresrocTranslator(data(validPayload))

        expect(result.regimeValue8).to.equal('Very Low')
        expect(result.regimeValue6).to.equal('Tidal')
        expect(result.regimeValue7).to.equal('All Year')
        expect(result.regimeValue13).to.equal('Other')
        expect(result.regimeValue15).to.equal('South West (incl Wessex)')
      })
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new CalculateChargePresrocTranslator(data(payload))

        expect(result).to.not.be.an.error()
      })

      describe("if 'compensationCharge' is false", () => {
        describe("and 'eiucSource' is missing", () => {
          it('still does not throw an error', async () => {
            const validPayload = {
              ...payload,
              compensationCharge: false
            }
            delete validPayload.eiucSource

            const result = new CalculateChargePresrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })
        })

        describe("and 'waterUndertaker' is missing", () => {
          it('still does not throw an error', async () => {
            const validPayload = {
              ...payload,
              compensationCharge: false
            }
            delete validPayload.waterUndertaker

            const result = new CalculateChargePresrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })
        })
      })

      describe("when 'periodStartDate' is the same as 'periodEndDate'", () => {
        it('still does not throw an error', async () => {
          const validPayload = {
            ...payload,
            periodStart: '01-APR-2020',
            periodEnd: '01-APR-2020'
          }

          const result = new CalculateChargePresrocTranslator(data(validPayload))

          expect(result).to.not.be.an.error()
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

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because the 'periodEnd' is less than 01-APR-2014", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            periodStart: '01-FEB-2014',
            periodEnd: '01-MAR-2014'
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because 'periodStart' and 'periodEnd' are not in the same financial year", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            periodStart: '01-APR-2021',
            periodEnd: '01-APR-2022'
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because 'compensationCharge' is true", () => {
        describe("and 'eiucSource' is missing", () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              compensationCharge: true
            }
            delete invalidPayload.eiucSource

            expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe("and 'eiucSource' is invalid", () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              compensationCharge: true,
              eiucSource: 'INVALID'
            }

            expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe("and 'waterUndertaker' is missing", () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              compensationCharge: true
            }
            delete invalidPayload.waterUndertaker

            expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe("because 'waterUndertaker' is not a boolean", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            compensationCharge: false,
            waterUndertaker: 'boom'
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because 'section126Factor' has more than 3 decimal places", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            section126Factor: 1.1239
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe('because ruleset is not `presroc`', () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            ruleset: 'INVALID'
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe('because loss is not valid', () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            loss: 'INVALID'
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe('because source is not valid', () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            source: 'INVALID'
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe('because season is not valid', () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            season: 'INVALID'
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe('because regionalChargingArea', () => {
        describe('is not valid', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              regionalChargingArea: 'INVALID'
            }

            expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload
            }
            delete invalidPayload.regionalChargingArea

            expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because twoPartTariff and compensationCharge are both true', () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            twoPartTariff: true,
            compensationCharge: true
          }

          expect(() => new CalculateChargePresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })
    })
  })
})
