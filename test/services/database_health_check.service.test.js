// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper } = require('../support/helpers')

// Thing under test
const { DatabaseHealthCheckService } = require('../../app/services')

describe('Database Health Check service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  it('confirms connection to the db by not throwing an error', async () => {
    await expect(DatabaseHealthCheckService.go()).to.not.reject()
  })

  it('returns stats about each table', async () => {
    const result = await DatabaseHealthCheckService.go()

    // We expect at least 5 tables to exist and be returned in the results
    expect(result.length).to.be.at.least(5)
    expect(result[0].relname).to.exist()
  })
})
