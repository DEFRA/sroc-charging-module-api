'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, GeneralHelper, InvoiceHelper } = require('../support/helpers')

// Thing under test
const { InvoiceRebillingInitialiseService } = require('../../app/services')

describe('Invoice Rebilling Initialise service', () => {
  let billRun
  let invoice

  beforeEach(async () => {
    await DatabaseHelper.clean()
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER', '2021')
  })

  it('creates two new invoices linked to the bill run', async () => {
    const result = await InvoiceRebillingInitialiseService.go(billRun, invoice)

    expect(result.cancelInvoice.billRunId).to.equal(billRun.id)
    expect(result.rebillInvoice.billRunId).to.equal(billRun.id)
  })

  it("returns a 'response' object containing the id and type of the invoices", async () => {
    const result = await InvoiceRebillingInitialiseService.go(billRun, invoice)

    const returnedCancelObject = result.response.invoices.find(element => element.rebilledType === 'C')
    const returnedRebillObject = result.response.invoices.find(element => element.rebilledType === 'R')

    expect(result.cancelInvoice.id).to.equal(returnedCancelObject.id)
    expect(result.rebillInvoice.id).to.equal(returnedRebillObject.id)
  })
})
