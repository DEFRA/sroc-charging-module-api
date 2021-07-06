// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers

// Things we need to stub
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'

// Thing under test
import ApproveBillRunService from '../../app/services/approve_bill_run.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
