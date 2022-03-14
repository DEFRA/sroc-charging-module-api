'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')
const GeneralHelper = require('../../support/helpers/general.helper')

// Thing under test
const BillRunStatusService = require('../../../app/services/bill_runs/bill_run_status.service')

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
