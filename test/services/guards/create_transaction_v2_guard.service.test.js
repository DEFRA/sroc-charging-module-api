'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const { NewBillRunHelper } = require('../../support/helpers')

// Thing under test
const { CreateTransactionV2GuardService } = require('../../../app/services')

describe('Create Transaction V2 guard service', () => {
  describe('When a valid presroc bill run is supplied', () => {
    it("doesn't throw an error", async () => {
      const validBillRun = await NewBillRunHelper.create(null, null, { ruleset: 'presroc' })

      const notErr = await expect(CreateTransactionV2GuardService.go(validBillRun)).to.not.reject()

      expect(notErr).to.not.be.an.error()
    })
  })

  describe('When an invalid payload is supplied', () => {
    it('throws an error', async () => {
      const invalidBillRun = await NewBillRunHelper.create(null, null, { ruleset: 'sroc' })

      const err = await expect(CreateTransactionV2GuardService.go(invalidBillRun)).to.reject()

      expect(err).to.be.an.error()
      expect(err.message).to.equal('Create Transaction v2 request must be for a presroc bill run')
    })
  })
})
