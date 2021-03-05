'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  RegimeHelper,
  SequenceCounterHelper
} = require('../support/helpers')

// Thing under test
const { SendBillRunReferenceService } = require('../../app/services')

describe.only('Send Bill Run Reference service', () => {
  let regime
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(regime.id, GeneralHelper.uuid4())
    await SequenceCounterHelper.addSequenceCounter(regime.id, billRun.region)
  })

  describe("When the 'bill run' can be sent", () => {
    it("sets the 'bill run' status to 'pending'", async () => {
      billRun.status = 'approved'

      await SendBillRunReferenceService.go(regime, billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun.status).to.equal('pending')
    })

    it.only("generates a file reference for the 'bill run'", async () => {
      billRun.status = 'approved'

      await SendBillRunReferenceService.go(regime, billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun.fileReference).to.equal('nalai50001')
    })
  })

  describe("When the 'bill run' cannot be sent", () => {
    describe("ecause the status is not 'approved'", () => {
      it('throws an error', async () => {
        const err = await expect(SendBillRunReferenceService.go(regime, billRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${billRun.id} does not have a status of 'approved'.`)
      })
    })
  })
})
