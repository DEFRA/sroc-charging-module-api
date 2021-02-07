'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, GeneralHelper } = require('../support/helpers')

// Thing under test
const { BillRunStatusService } = require('../../app/services')

describe('Bill run status service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe("When there is a matching 'bill run'", () => {
    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    })

    it("returns the 'status' for it", async () => {
      const result = await BillRunStatusService.go(billRun.id)

      expect(result.status).to.equal(billRun.status)
    })
  })

  describe("When there is no matching 'bill run'", () => {
    it('throws an error', async () => {
      const unknownBillRunId = GeneralHelper.uuid4()
      const err = await BillRunStatusService.go(unknownBillRunId)

      expect(err).to.be.an.error()
      expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
    })
  })
})
