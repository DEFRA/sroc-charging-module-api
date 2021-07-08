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
  let originalInvoice
  let rebillBillRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
    const originalBillRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    originalInvoice = await InvoiceHelper.addInvoice(originalBillRun.id, 'CUSTOMER', '2021')
    rebillBillRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  it('creates two new invoices linked to the bill run', async () => {
    const result = await InvoiceRebillingInitialiseService.go(rebillBillRun, originalInvoice)

    expect(result.cancelInvoice.billRunId).to.equal(rebillBillRun.id)
    expect(result.rebillInvoice.billRunId).to.equal(rebillBillRun.id)
  })

  it('creates two new invoices with the same flags as the original', async () => {
    const result = await InvoiceRebillingInitialiseService.go(rebillBillRun, originalInvoice)

    // deminimisInvoice
    expect(result.cancelInvoice.deminimisInvoice).to.equal(originalInvoice.deminimisInvoice)
    expect(result.rebillInvoice.deminimisInvoice).to.equal(originalInvoice.deminimisInvoice)

    // minimumChargeInvoice
    expect(result.cancelInvoice.minimumChargeInvoice).to.equal(originalInvoice.minimumChargeInvoice)
    expect(result.rebillInvoice.minimumChargeInvoice).to.equal(originalInvoice.minimumChargeInvoice)
  })

  it("sets the bill run status to 'pending'", async () => {
    await InvoiceRebillingInitialiseService.go(rebillBillRun, originalInvoice)
    const refreshedBillRun = await rebillBillRun.$query()

    expect(refreshedBillRun.status).to.equal('pending')
  })

  describe('when a second invoice for the same customer ref, and financial year is being rebilled', () => {
    let secondOriginalInvoice
    beforeEach(async () => {
      // Initialised the first rebilling invoices
      await InvoiceRebillingInitialiseService.go(rebillBillRun, originalInvoice)

      const secondOriginalBillRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
      secondOriginalInvoice = await InvoiceHelper.addInvoice(secondOriginalBillRun.id, 'CUSTOMER', '2021')
    })

    it('still creates two new invoices linked to the bill run for the second invoice', async () => {
      const result = await InvoiceRebillingInitialiseService.go(rebillBillRun, secondOriginalInvoice)

      expect(result.cancelInvoice.billRunId).to.equal(rebillBillRun.id)
      expect(result.rebillInvoice.billRunId).to.equal(rebillBillRun.id)
    })
  })
})
