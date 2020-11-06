'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const testData = require('../support/fixtures/charge.json')

// Thing under test
const { ChargeModel } = require('../../app/models')
const { ValidationError } = require('@hapi/joi')

describe('Charge model', () => {
  it('can be created with valid data', async () => {
    const charge = new ChargeModel(testData)

    // Cast date strings to date values for ease of testing
    const testDataToCheckAgainst = {
      ...testData,
      chargePeriodStart: new Date(testData.chargePeriodStart),
      chargePeriodEnd: new Date(testData.chargePeriodEnd),
      chargeCredit: true
    }

    // Check that the value of each key in the charge object matches the original value
    for (const [key, value] of Object.entries(charge)) {
      expect(testDataToCheckAgainst[key]).to.equal(value)
    }
  })

  it('throws a validation error for invalid data', async () => {
    const invalidData = {
      ...testData,
      chargeCredit: 'INVALID_DATA'
    }

    expect(() => new ChargeModel(invalidData)).to.throw(ValidationError)
  })
})
