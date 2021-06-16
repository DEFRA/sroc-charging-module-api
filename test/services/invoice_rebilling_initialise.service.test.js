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

  it('creates two new invoices with the same flags as the original', async () => {
    const result = await InvoiceRebillingInitialiseService.go(billRun, invoice)

    // deminimisInvoice
    expect(result.cancelInvoice.deminimisInvoice).to.equal(invoice.deminimisInvoice)
    expect(result.rebillInvoice.deminimisInvoice).to.equal(invoice.deminimisInvoice)

    // minimumChargeInvoice
    expect(result.cancelInvoice.minimumChargeInvoice).to.equal(invoice.minimumChargeInvoice)
    expect(result.rebillInvoice.minimumChargeInvoice).to.equal(invoice.minimumChargeInvoice)
  })

  it("sets the bill run status to 'pending'", async () => {
    await InvoiceRebillingInitialiseService.go(billRun, invoice)
    const refreshedBillRun = await billRun.$query()

    expect(refreshedBillRun.status).to.equal('pending')
  })

  it("returns a 'response' object containing the id and type of the invoices", async () => {
    const result = await InvoiceRebillingInitialiseService.go(billRun, invoice)

    const returnedCancelObject = result.response.invoices.find(element => element.rebilledType === 'C')
    const returnedRebillObject = result.response.invoices.find(element => element.rebilledType === 'R')

    expect(result.cancelInvoice.id).to.equal(returnedCancelObject.id)
    expect(result.rebillInvoice.id).to.equal(returnedRebillObject.id)
  })
})
