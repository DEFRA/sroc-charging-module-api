'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code
const { ValidationError } = require('joi')

// Thing under test
const { CalculateChargeSrocTranslator } = require('../../app/translators')

describe.only('Calculate Charge Sroc translator', () => {
  let validPayload

  const payload = {
    ruleset: 'sroc',
    chargeCategoryCode: '2.1.211',
    // NOTE: these dates should be 01-APR-2022 and 31-MAR-2023, ie. 2022/23 financial year. However as we suspect WRLS
    // will need to test against the current financial year (ie. 2021/22), we have set the validation accordingly.
    // This will be reverted prior to going into production.
    periodStart: '01-APR-2021',
    periodEnd: '31-MAR-2022',
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
    authorisedVolume: 1,
    actualVolume: 1,
    credit: false,
    adjustmentFactor: 1,
    abatementFactor: 1,
    aggregateProportion: 1
  }

  const data = (payload, regime = 'wrls') => {
    return {
      regime,
      ...payload
    }
  }

  describe('Default values', () => {
    it('defaults supportedSourceName to `Not Applicable` when `undefined` and supportedSource is `false`', async () => {
      const supportedSourcePayload = {
        ...payload,
        supportedSource: false,
        supportedSourceName: undefined
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(supportedSourcePayload))

      expect(testTranslator.headerAttr6).to.be.a.string().and.equal('Not Applicable')
    })
  })

  describe('calculating prorataDays', () => {
    it('correctly calculates the format', async () => {
      const proraratPayload = {
        ...payload,
        billableDays: 128,
        authorisedDays: 256
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(proraratPayload))

      expect(testTranslator.lineAttr3).to.equal('128/256')
    })

    it('correctly pads values to 3 digits', async () => {
      const proraratPayload = {
        ...payload,
        billableDays: 8,
        authorisedDays: 16
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(proraratPayload))

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

      const testTranslator = new CalculateChargeSrocTranslator(data(proraratPayload))

      expect(testTranslator.lineAttr3).to.equal('000/000')
    })
  })

  describe('calculating the financial year', () => {
    it("correctly determines the previous year for 'period' dates in March or earlier", async () => {
      const financialYearPayload = {
        ...payload,
        periodStart: '01-MAR-2023',
        periodEnd: '30-MAR-2023'
      }
      const testTranslator = new CalculateChargeSrocTranslator(data(financialYearPayload))

      expect(testTranslator.chargeFinancialYear).to.equal(2022)
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

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2021)
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

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2022)
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

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2022)
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

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2022)
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

        expect(result.chargePeriodStart).to.be.a.date()

        expect(result.chargePeriodStart.getDate()).to.equal(1)
        // Months are zero based, for example, January is 0 and December is 11
        expect(result.chargePeriodStart.getMonth()).to.equal(3)
        expect(result.chargePeriodStart.getFullYear()).to.equal(2022)
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

          expect(testTranslator.regimeValue11).to.be.a.number().and.equal(0.75)
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

          expect(testTranslator.headerAttr2).to.be.a.number().and.equal(0.75)
        })
      })

      describe('when authorisedVolume is provided', () => {
        before(async () => {
          validPayload = {
            ...payload,
            authorisedVolume: 1.75
          }
        })

        it('accepts a decimal value', async () => {
          const testTranslator = new CalculateChargeSrocTranslator(data(validPayload))

          expect(testTranslator.headerAttr3).to.be.a.number().and.equal(1.75)
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

          expect(testTranslator.regimeValue20).to.be.a.number().and.equal(1.75)
        })
      })

      describe('if twoPartTariff is `false`', () => {
        describe('and actualVolume is present', () => {
          it('does not throw an error', async () => {
            const validPayload = {
              ...payload,
              twoPartTariff: false,
              actualVolume: 1.75
            }

            const result = new CalculateChargeSrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })
        })

        describe('and actualVolume is not present', () => {
          it('does not throw an error', async () => {
            const validPayload = {
              ...payload,
              twoPartTariff: false,
              actualVolume: undefined
            }

            const result = new CalculateChargeSrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })
        })
      })

      describe('if compensationCharge is `false`', () => {
        describe('and regionalChargingArea is present', () => {
          it('does not throw an error', async () => {
            const validPayload = {
              ...payload,
              compensationCharge: false,
              regionalChargingArea: 'Anglian'
            }

            const result = new CalculateChargeSrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })
        })

        describe('and regionalChargingArea is not present', () => {
          it('does not throw an error', async () => {
            const validPayload = {
              ...payload,
              compensationCharge: false,
              regionalChargingArea: undefined
            }

            const result = new CalculateChargeSrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
          })
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

        describe('and waterUndertaker is not present', () => {
          it('does not throw an error', async () => {
            const validPayload = {
              ...payload,
              compensationCharge: false,
              waterUndertaker: undefined
            }

            const result = new CalculateChargeSrocTranslator(data(validPayload))

            expect(result).to.not.be.an.error()
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

      describe('when loss is provided', () => {
        it('ensures the correct casing', async () => {
          const lossPayload = {
            ...payload,
            loss: 'low'
          }

          const testTranslator = new CalculateChargeSrocTranslator(data(lossPayload))

          expect(testTranslator.regimeValue8).to.equal('Low')
        })
      })

      describe('when regionalChargingArea is provided', () => {
        it('ensures the correct casing', async () => {
          const regionalChargingAreaPayload = {
            ...payload,
            regionalChargingArea: 'devon and cornwall (south west)'
          }

          const testTranslator = new CalculateChargeSrocTranslator(data(regionalChargingAreaPayload))

          expect(testTranslator.regimeValue15).to.equal('Devon and Cornwall (South West)')
        })
      })

      describe('when supportedSourceName is provided', () => {
        it('ensures the correct casing', async () => {
          const supportedSourceNamePayload = {
            ...payload,
            supportedSource: true,
            supportedSourceName: 'ouse - hermitage'
          }

          const testTranslator = new CalculateChargeSrocTranslator(data(supportedSourceNamePayload))

          expect(testTranslator.headerAttr6).to.equal('Ouse - Hermitage')
        })
      })
    })

    describe('when the data is not valid', () => {
      describe('because ruleset', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
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
            const invalidPayload = { ...payload }
            delete invalidPayload.chargeCategoryCode

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because periodStart', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
            delete invalidPayload.periodStart

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is earlier than 1 April 2021', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              periodStart: '30-MAR-2021',
              periodEnd: '31-MAR-2021'
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
            const invalidPayload = { ...payload }
            delete invalidPayload.periodEnd

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
            const invalidPayload = { ...payload }
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
            const invalidPayload = { ...payload }
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
            const invalidPayload = { ...payload }
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
            const invalidPayload = { ...payload }
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
            const invalidPayload = { ...payload }
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
            const invalidPayload = { ...payload }
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
              twoPartTariff: true,
              section127Agreement: true
            }
          })

          describe('and actualVolume is missing', () => {
            it('throws an error', async () => {
              delete invalidPayload.actualVolume

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('and section127Agreement is `false`', () => {
            it('throws an error', async () => {
              invalidPayload.section127Agreement = false

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('and compensationCharge is `true`', () => {
            it('throws an error', async () => {
              invalidPayload = {
                ...invalidPayload,
                compensationCharge: true,
                regionalChargingArea: 'Anglian',
                waterUndertaker: false
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })
      })

      describe('because compensationCharge', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
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

          describe('and regionalChargingArea', () => {
            describe('is missing', () => {
              it('throws an error', async () => {
                delete invalidPayload.regionalChargingArea

                expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
              })
            })

            describe('is invalid', () => {
              it('throws an error', async () => {
                invalidPayload.regionalChargingArea = 'INVALID'

                expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
              })
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
            const invalidPayload = { ...payload }
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
            const invalidPayload = { ...payload }
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
              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })

          describe('and supportedSourceName is not valid', () => {
            it('throws an error', async () => {
              invalidPayload.supportedSourceName = 'INVALID'

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })

        describe('is `false`', () => {
          let invalidPayload

          beforeEach(async () => {
            invalidPayload = {
              ...payload,
              supportedSource: false
            }
          })

          describe('and supportedSourceName is present', () => {
            it('throws an error', async () => {
              invalidPayload = {
                ...invalidPayload,
                supportedSourceName: 'Ouse - Hermitage'
              }

              expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
            })
          })
        })
      })

      describe('because loss', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
            delete invalidPayload.loss

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is not valid', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              loss: 'INVALID'
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because authorisedVolume', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
            delete invalidPayload.authorisedVolume

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              authorisedVolume: 0
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is less than 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              authorisedVolume: -100
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because credit', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
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

      describe('because adjustmentFactor', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
            delete invalidPayload.adjustmentFactor

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is not a number', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              adjustmentFactor: 'INVALID'
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              adjustmentFactor: 0
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is less than 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              adjustmentFactor: -1
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because abatementFactor', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
            delete invalidPayload.abatementFactor

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is not a number', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              abatementFactor: 'INVALID'
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              abatementFactor: 0
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is less than 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              abatementFactor: -1
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe('because aggregateProportion', () => {
        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = { ...payload }
            delete invalidPayload.aggregateProportion

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is not a number', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              aggregateProportion: 'INVALID'
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              aggregateProportion: 0
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is less than 0', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              aggregateProportion: -1
            }

            expect(() => new CalculateChargeSrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })
    })
  })
})
