'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { ListCustomerFilesService } = require('../../../../app/services')

describe('List Customer Files service', () => {
  it('returns `true`', async () => {
    const result = await ListCustomerFilesService.go()

    expect(result).to.be.true()
  })
})
