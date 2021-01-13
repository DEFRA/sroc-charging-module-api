'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper } = require('../support/helpers')

// Thing under test
const { BillRunService } = require('../../app/services')

describe('Invoice service', () => {
  const authorisedSystemId = '6fd613d8-effb-4bcd-86c7-b0025d121692'
  const regimeId = '4206994c-5db9-4539-84a6-d4b6a671e2ba'
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId)
    })

    it('returns the matching bill run', async () => {
      const result = await BillRunService.go(billRun.id)

      expect(result.id).to.equal(billRun.id)
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    const unknownBillRunId = '05f32bd9-7bce-42c2-8d6a-b14a8e26d531'

    describe('because no matching bill run exists', () => {
      it('throws an error', async () => {
        const err = await expect(BillRunService.go(unknownBillRunId)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
      })
    })

    describe('because the bill run is not editable', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.addBillRun(authorisedSystemId, regimeId, 'A', 'billed')
      })

      it('throws an error', async () => {
        const err = await expect(BillRunService.go(billRun.id)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message)
          .to
          .equal(`Bill run ${billRun.id} cannot be edited because its status is billed.`)
      })
    })
  })
})
