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

  const billRunPath = id => {
    return `/test/wrls/bill-runs/${id}`
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe("When the request is 'bill run' related", () => {
    describe("and is for a valid 'bill run'", () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
      })

      it('returns the matching bill run', async () => {
        const result = await RequestBillRunService.go(billRunPath(billRun.id), billRun.id)

        expect(result.id).to.equal(billRun.id)
      })
    })

    describe("but is for an invalid 'bill run'", () => {
      describe('because no matching bill run exists', () => {
        it('throws an error', async () => {
          const unknownBillRunId = GeneralHelper.uuid4()
          const err = await expect(RequestBillRunService.go(billRunPath(unknownBillRunId), unknownBillRunId)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
        })
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
