'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { ValidationError } = require('joi')
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { TransactionPresrocTranslator } = require('../../app/translators')

describe('Transaction Presroc translator', () => {
  const payload = {
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

  const data = (
    payload,
    billRunId = GeneralHelper.uuid4(),
    regimeId = GeneralHelper.uuid4(),
    authorisedSystemId = GeneralHelper.uuid4()) => {
    return {
      billRunId,
      regimeId,
      authorisedSystemId,
      ...payload
    }
  }

  describe('Default values', () => {
    it("defaults 'subjectToMinimumCharge' to 'false'", async () => {
      const testTranslator = new TransactionPresrocTranslator(data(payload))

      expect(testTranslator.subjectToMinimumCharge).to.be.a.boolean().and.equal(false)
    })

    it("defaults 'ruleset' to 'presroc'", async () => {
      const testTranslator = new TransactionPresrocTranslator(data(payload))

      expect(testTranslator.ruleset).to.be.a.string().and.equal('presroc')
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new TransactionPresrocTranslator(data(payload))

        expect(result).to.not.be.an.error()
      })
    })

    describe('when the data is not valid', () => {
      describe("because 'region'", () => {
        describe('is not a valid region', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              region: 'INVALID_REGION'
            }

            expect(() => new TransactionPresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload
            }
            delete invalidPayload.region

            expect(() => new TransactionPresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })

      describe("because 'areaCode'", () => {
        describe('is not a valid area', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload,
              areaCode: 'INVALID_AREA'
            }

            expect(() => new TransactionPresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })

        describe('is missing', () => {
          it('throws an error', async () => {
            const invalidPayload = {
              ...payload
            }
            delete invalidPayload.areaCode

            expect(() => new TransactionPresrocTranslator(data(invalidPayload))).to.throw(ValidationError)
          })
        })
      })
    })
  })
})
