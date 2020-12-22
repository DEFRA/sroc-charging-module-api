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

  describe('Default values', () => {
    it("defaults 'newLicence' to 'false'", async () => {
      const testTranslator = new TransactionTranslator(data)

      expect(testTranslator.newLicence).to.be.a.boolean().and.equal(false)
    })

    it("defaults 'ruleset' to 'presroc'", async () => {
      const testTranslator = new TransactionTranslator(data)

      expect(testTranslator.ruleset).to.be.a.string().and.equal('presroc')
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        expect(() => new TransactionTranslator(data).to.not.throw())
      })
    })

    describe('when the data is not valid', () => {
      describe("because 'region' is not a valid region", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            region: 'INVALID_REGION'
          }

          expect(() => new TransactionTranslator(invalidData)).to.throw(ValidationError)
        })
      })

      describe("because 'areaCode' is not a valid area", () => {
        it('throws an error', async () => {
          const invalidData = {
            ...data,
            areaCode: 'INVALID_AREA'
          }

          expect(() => new TransactionTranslator(invalidData)).to.throw(ValidationError)
        })
      })
    })
  })
})
