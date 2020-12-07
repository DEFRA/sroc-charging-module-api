'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { ValidationError } = require('joi')

// Thing under test
const { TransactionTranslator } = require('../../app/translators')

describe('Transaction translator', () => {
  const data = {
    periodStart: '01-APR-2019',
    periodEnd: '31-MAR-2020',
    credit: false,
    billableDays: 310,
    authorisedDays: 365,
    volume: '6.22',
    source: 'Supported',
    season: 'Summer',
    loss: 'Low',
    twoPartTariff: false,
    compensationCharge: false,
    eiucSource: 'Tidal',
    waterUndertaker: false,
    regionalChargingArea: 'Anglian',
    section127Agreement: false,
    section130Agreement: false,
    customerReference: 'TH230000222',
    lineDescription: 'Well at Chigley Town Hall',
    licenceNumber: 'TONY/TF9222/37',
    chargePeriod: '01-APR-2018 - 31-MAR-2019',
    chargeElementId: '',
    batchNumber: 'TONY10',
    region: 'W',
    areaCode: 'ARCA'
  }

  describe('calculating prorataDays', () => {
    it('correctly calculates the format', async () => {
      const testTranslator = new TransactionTranslator({
        ...data,
        billableDays: 128,
        authorisedDays: 256
      })

      expect(testTranslator.lineAttr3).to.equal('128/256')
    })

    it('correctly pads values to 3 digits', async () => {
      const testTranslator = new TransactionTranslator({
        ...data,
        billableDays: 8,
        authorisedDays: 16
      })

      expect(testTranslator.lineAttr3).to.equal('008/016')
    })
  })

  describe('calculating the financial year', () => {
    it("correctly determines the previous year for 'period' dates in March or earlier", async () => {
      const testTranslator = new TransactionTranslator({
        ...data,
        periodStart: '01-MAR-2022',
        periodEnd: '30-MAR-2022'
      })

      expect(testTranslator.financialYear).to.equal(2021)
    })

    it("correctly determines the current year for 'period' dates in April onwards", async () => {
      const testTranslator = new TransactionTranslator({
        ...data,
        periodStart: '01-APR-2021',
        periodEnd: '01-MAY-2021'
      })

      expect(testTranslator.financialYear).to.equal(2021)
    })
  })

  describe('Default values', () => {
    it("defaults 'newLicence' to 'false'", async () => {
      const testTranslator = new TransactionTranslator(data)

      expect(testTranslator.newLicence).to.be.a.boolean().and.equal(false)
    })

    it("defaults 'regimeValue11' to '1.0' when 'section126Factor' is not provided", async () => {
      const testTranslator = new TransactionTranslator(data)

      expect(testTranslator.regimeValue11).to.be.a.number().and.equal(1.0)
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        expect(() => new TransactionTranslator(data).to.not.throw())
      })
    })

    describe('when the data is not valid', () => {
      describe("because the 'periodStart' is greater than the 'periodEnd'", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            periodStart: '01-APR-2021'
          }

          expect(() => new TransactionTranslator(invalidData)).to.throw(ValidationError)
        })
      })

      describe("because the 'periodEnd' is less than 01-APR-2014", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            periodStart: '01-FEB-2014',
            periodEnd: '01-MAR-2014'
          }

          expect(() => new TransactionTranslator(invalidData)).to.throw(ValidationError)
        })
      })

      describe("because 'eiucSource' is empty when 'compensationCharge' is true", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            compensationCharge: true,
            eiucSource: ''
          }

          expect(() => new TransactionTranslator(invalidData)).to.throw(ValidationError)
        })
      })

      describe("because 'periodStart' and 'periodEnd' are not in the same financial year", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            periodStart: '01-APR-2021',
            periodEnd: '01-APR-2022'
          }

          expect(() => new TransactionTranslator(invalidData)).to.throw(ValidationError)
        })
      })
    })
  })
})
