'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, GeneralHelper } = require('../support/helpers')

// Thing under test
const { RequestBillRunService } = require('../../app/services')

describe('Request bill run service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe("When the request is 'bill run' related", () => {
    describe("and is for a valid 'bill run'", () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
      })

      it('returns the matching bill run', async () => {
        const result = await RequestBillRunService.go(`/test/wrls/bill-runs/${billRun.id}`)

        expect(result.id).to.equal(billRun.id)
      })
    })
  })

  describe("When the request isn't 'bill run' related", () => {
    it("returns 'null'", async () => {
      const result = await RequestBillRunService.go('/test/wrls/invoice-runs/12345')

      expect(result).to.be.null()
    })
  })
})
