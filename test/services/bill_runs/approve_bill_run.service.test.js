'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')

// Thing under test
const ApproveBillRunService = require('../../../app/services/bill_runs/approve_bill_run.service.js')

describe('Approve Bill Run service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  describe("When the 'bill run' can be approved", () => {
    it("approves the 'bill run'", async () => {
      billRun.status = 'generated'

      await ApproveBillRunService.go(billRun)

      const refreshedBillRun = await billRun.$query()

      expect(refreshedBillRun.status).to.equal('approved')
    })
  })

  describe("When the 'bill run' cannot be approved", () => {
    describe("because the status is not 'generated'", () => {
      it('throws an error', async () => {
        const err = await expect(ApproveBillRunService.go(billRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${billRun.id} does not have a status of 'generated'.`)
      })
    })
  })
})
