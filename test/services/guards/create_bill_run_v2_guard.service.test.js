'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { CreateBillRunV2GuardService } = require('../../../app/services')

describe('Create Bill Run V2 guard service', () => {
  describe('When a valid payload is supplied', () => {
    it("doesn't throw an error", async () => {
      const payload = { valid: true }

      const notErr = await expect(CreateBillRunV2GuardService.go(payload)).to.not.reject()

      expect(notErr).to.not.be.an.error()
    })
  })

  describe('When an invalid payload is supplied', () => {
    it('throws an error', async () => {
      const payload = { ruleset: 'invalid' }

      const err = await expect(CreateBillRunV2GuardService.go(payload)).to.reject()

      expect(err).to.be.an.error()
      expect(err.message).to.equal('Create Bill Run v2 request cannot contain ruleset parameter')
    })
  })
})
