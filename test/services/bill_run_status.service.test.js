// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'

// Thing under test
import BillRunStatusService from '../../app/services/bill_run_status.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Bill run status service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  it("returns a formatted 'status' for the bill run instance", async () => {
    const result = await BillRunStatusService.go(billRun)

    expect(result.status).to.equal(billRun.status)
  })
})
