'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Thing under test
const { CheckBillRunService } = require('../../app/services')

describe('Check bill run service', () => {
  describe("When the request is 'bill run' related", () => {
    it("returns 'true'", async () => {
      const result = await CheckBillRunService.go('/test/wrls/bill-runs/12345')

      expect(result).to.be.true()
    })
  })

  describe("When the request is 'bill run' related", () => {
    it("returns 'false'", async () => {
      const result = await CheckBillRunService.go('/test/wrls/invoice-runs/12345')

      expect(result).to.be.false()
    })
  })
})
