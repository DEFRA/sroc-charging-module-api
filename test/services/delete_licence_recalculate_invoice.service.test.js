'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { DeleteLicenceRecalculateInvoiceService } = require('../../app/services')

describe('Delete Licence Recalculate Invoice service', () => {
  it('returns true', async () => {
    const result = await DeleteLicenceRecalculateInvoiceService.go()

    expect(result).to.be.true()
  })
})
