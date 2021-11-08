'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code
const { ValidationError } = require('joi')

// Thing under test
const { CalculateChargeSrocTranslator } = require('../../app/translators')

describe('Calculate Charge Sroc translator', () => {
  let validPayload

  const payload = {
    ruleset: 'sroc',
    chargeCategoryCode: 'CHARGE', // confirm possible value
    periodStart: '01-APR-2022',
    periodEnd: '31-MAR-2023',
    authorisedDays: 214,
    billableDays: 214,
    winterOnly: false,
    section130Agreement: false,
    section127Agreement: false,
    twoPartTariff: false,
    compensationCharge: false,
    waterCompanyCharge: false,
    supportedSource: false,
    loss: 'Low',
    volume: 1,
    credit: false
  }

  const data = (payload, regime = 'wrls') => {
    return {
      regime,
      ...payload
    }
  }

  describe('Default values', () => {
    it('defaults abatementFactor to `1.0`', async () => {
      const abatementFactorPayload = {
        ...payload,
        abatementFactor: null
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(abatementFactorPayload))

      expect(testTranslator.abatementFactor).to.be.a.number().and.equal(1.0)
    })

    it('defaults aggregateProportion to `1.0`', async () => {
      const aggregateProportionPayload = {
        ...payload,
        abatementFactor: null
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(aggregateProportionPayload))

      expect(testTranslator.aggregateProportion).to.be.a.number().and.equal(1.0)
    })
  })

  describe('calculating the financial year', () => {
    it("correctly determines the previous year for 'period' dates in March or earlier", async () => {
      const financialYearPayload = {
        ...payload,
        periodStart: '01-MAR-2022',
        periodEnd: '30-MAR-2022'
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(financialYearPayload))

      expect(testTranslator.chargeFinancialYear).to.equal(2021)
    })

    it("correctly determines the current year for 'period' dates in April onwards", async () => {
      const financialYearPayload = {
        ...payload,
        periodStart: '01-APR-2022',
        periodEnd: '01-MAY-2022'
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(financialYearPayload))

      expect(testTranslator.chargeFinancialYear).to.equal(2022)
    })
  })

  describe('handling of date formats', () => {
    describe("when period start and end are formatted as 'DD-MMM-YYYY'", () => {
      it('parses them correctly', async () => {
        const result = new CalculateChargeSrocTranslator(data(payload))

        expect(result.periodStart).to.be.a.date()

        expect(result.periodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.periodStart.getMonth()).to.equal(3)
        expect(result.periodStart.getFullYear()).to.equal(2022)
      })
    })

    describe("when period start and end are formatted as 'DD-MM-YYYY'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '01-04-2022',
          periodEnd: '31-03-2023'
        }
        const result = new CalculateChargeSrocTranslator(data(dateFormatPayload))

        expect(result.periodStart).to.be.a.date()

        expect(result.periodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.periodStart.getMonth()).to.equal(3)
        expect(result.periodStart.getFullYear()).to.equal(2022)
      })
    })

    describe("when period start and end are formatted as 'YYYY-MM-DD'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '2022-04-01',
          periodEnd: '2023-03-31'
        }
        const result = new CalculateChargeSrocTranslator(data(dateFormatPayload))

        expect(result.periodStart).to.be.a.date()

        expect(result.periodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.periodStart.getMonth()).to.equal(3)
        expect(result.periodStart.getFullYear()).to.equal(2022)
      })
    })

    describe("when period start and end are formatted as 'DD/MM/YYYY'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '01/04/2022',
          periodEnd: '31/03/2023'
        }
        const result = new CalculateChargeSrocTranslator(data(dateFormatPayload))

        expect(result.periodStart).to.be.a.date()

        expect(result.periodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.periodStart.getMonth()).to.equal(3)
        expect(result.periodStart.getFullYear()).to.equal(2022)
      })
    })

    describe("when period start and end are formatted as 'YYYY/MM/DD'", () => {
      it('parses them correctly', async () => {
        const dateFormatPayload = {
          ...payload,
          periodStart: '2022/04/01',
          periodEnd: '2023/03/31'
        }
        const result = new CalculateChargeSrocTranslator(data(dateFormatPayload))

        expect(result.periodStart).to.be.a.date()

        expect(result.periodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.periodStart.getMonth()).to.equal(3)
        expect(result.periodStart.getFullYear()).to.equal(2022)
      })
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new CalculateChargeSrocTranslator(data(payload))

        expect(result).to.not.be.an.error()
      })

      describe('when abatementFactor is provided', () => {
        before(async () => {
          validPayload = {
            ...payload,
            abatementFactor: 0.75
          }
        })

        it('accepts a decimal value', async () => {
          const testTranslator = new CalculateChargeSrocTranslator(data(validPayload))

          expect(testTranslator.abatementFactor).to.be.a.number().and.equal(0.75)
        })
      })

      describe('when aggregateProportion is provided', () => {
        before(async () => {
          validPayload = {
            ...payload,
            aggregateProportion: 0.75
          }
        })

        it('accepts a decimal value', async () => {
          const testTranslator = new CalculateChargeSrocTranslator(data(validPayload))

          expect(testTranslator.aggregateProportion).to.be.a.number().and.equal(0.75)
        })
      })

      describe('when volume is provided', () => {
        before(async () => {
          validPayload = {
            ...payload,
            volume: 1.75
          }
        })

        it('accepts a decimal value', async () => {
          const testTranslator = new CalculateChargeSrocTranslator(data(validPayload))

          expect(testTranslator.volume).to.be.a.number().and.equal(1.75)
        })
      })

      describe('when actualVolume is provided', () => {
        before(async () => {
          validPayload = {
            ...payload,
            actualVolume: 1.75
          }
        })

        it('accepts a decimal value', async () => {
          const testTranslator = new CalculateChargeSrocTranslator(data(validPayload))

          expect(testTranslator.actualVolume).to.be.a.number().and.equal(1.75)
        })
      })

      describe('if compensationCharge is `false`', () => {
        describe('and regionalChargingArea is present', () => {
          it('does not throw an error', async () => {
            const validPayload = {
              ...payload,
              compensationCharge: false,
              regionalChargingArea: 'AREA'
            }

            const result = new CalculateChargeSrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })

          describe('and waterUndertaker is present', () => {
            it('does not throw an error', async () => {
              const validPayload = {
                ...payload,
                compensationCharge: false,
                waterUndertaker: true
              }

              const result = new CalculateChargeSrocTranslator(data(validPayload))

              expect(result).to.not.be.an.error()
            })
          })
        })
      })

      describe('when periodStartDate is the same as periodEndDate', () => {
        it('still does not throw an error', async () => {
          const validPayload = {
            ...payload,
            periodStart: '01-APR-2022',
            periodEnd: '01-APR-2022'
          }

          const result = new CalculateChargeSrocTranslator(data(validPayload))

          expect(result).to.not.be.an.error()
        })
      })

      describe('when the data is not valid', () => {
        describe('because ruleset', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.ruleset

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not `sroc`', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                ruleset: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because chargeCategoryCode', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.chargeCategoryCode

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because periodStart', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.periodStart

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe("is earlier than 1 April 2022'", () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                periodStart: '31-MAR-2022'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe("is greater than periodEnd'", () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                periodStart: '01-APR-2031'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because periodEnd', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.periodEnd

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is earlier than 01-APR-2022', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                periodStart: '01-FEB-2022',
                periodEnd: '01-MAR-2022'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not in the same finanal year as periodStart', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                periodStart: '01-FEB-2022',
                periodEnd: '01-JUN-2024'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because authorisedDays', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.authorisedDays

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is a decimal', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                authorisedDays: 123.45
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is below 0', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                authorisedDays: -100
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is over 366', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                authorisedDays: 367
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because billableDays', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.billableDays

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is below 0', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                billableDays: -100
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is over 366', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                billableDays: 367
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because winterOnly', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.winterOnly

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                winterOnly: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because section130Agreement', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.section130Agreement

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                section130Agreement: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because section127Agreement', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.section127Agreement

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                section127Agreement: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because twoPartTariff', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.twoPartTariff

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                twoPartTariff: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is `true`', () => {
            let invalidPayload

            beforeEach(async () => {
              invalidPayload = {
                ...payload,
                twoPartTariff: true
              }
            })

            describe('and actualVolume is missing', () => {
              it('throws an error', async () => {
                delete invalidPayload.actualVolume

                expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
              })
            })
          })
        })

        describe('because compensationCharge', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.compensationCharge

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                compensationCharge: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is `true`', () => {
            let invalidPayload

            beforeEach(async () => {
              invalidPayload = {
                ...payload,
                compensationCharge: true
              }
            })

            describe('and regionalChargingArea is missing', () => {
              it('throws an error', async () => {
                delete invalidPayload.regionalChargingArea

                expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
              })
            })

            describe('and waterUndertaker is missing', () => {
              it('throws an error', async () => {
                delete invalidPayload.waterUndertaker

                expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
              })
            })
          })
        })

        describe('because waterUndertaker', () => {
          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                waterUndertaker: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because waterCompanyCharge', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.waterCompanyCharge

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                waterCompanyCharge: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because supportedSource', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.supportedSource

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })

            describe('is not a boolean', () => {
              it('throws an error', async () => {
                const invalidPayload = {
                  ...payload,
                  supportedSource: 'INVALID'
                }

                expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
              })
            })
          })

          describe('is `true`', () => {
            let invalidPayload

            beforeEach(async () => {
              invalidPayload = {
                ...payload,
                supportedSource: true
              }
            })

            describe('and supportedSourceName is missing', () => {
              it('throws an error', async () => {
                delete invalidPayload.supportedSourceName

                expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
              })
            })
          })
        })

        describe('because loss', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.loss

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because volume', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.volume

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is 0', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                volume: 0
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is less than 0', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                volume: -100
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('because credit', () => {
          describe('is missing', () => {
            it('throws an error', async () => {
              const invalidPayload = payload
              delete invalidPayload.credit

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('is not a boolean', () => {
            it('throws an error', async () => {
              const invalidPayload = {
                ...payload,
                credit: 'INVALID'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })
      })
    })
  })
})
