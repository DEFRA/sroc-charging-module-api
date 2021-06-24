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
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  it("returns a formatted 'status' for the bill run instance", async () => {
    const result = await BillRunStatusService.go(billRun)

    expect(result.status).to.equal(billRun.status)
  })
})
