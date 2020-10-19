const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code
const Charge = require('../../app/models/charge.model')
const { ValidationError } = require('@hapi/joi')

const testData = require('../support/fixtures/charge.json')

describe('Charge model', () => {
  it('can be created with valid data', async () => {
    const charge = new Charge(testData)

    // Cast date strings to date values for ease of testing
    const testDataToCheckAgainst = {
      ...testData,
      charge_period_start: new Date(testData.charge_period_start),
      charge_period_end: new Date(testData.charge_period_end)
    }

    // Check that the value of each key in the charge object matches the original value
    for (const [key, value] of Object.entries(charge)) {
      expect(testDataToCheckAgainst[key]).to.equal(value)
    }
  })

  it('throws a validation error for invalid data', async () => {
    const invalidData = {
      ...testData,
      charge_credit: 'INVALID_DATA'
    }

    expect(() => new Charge(invalidData)).to.throw(ValidationError)
  })
})
