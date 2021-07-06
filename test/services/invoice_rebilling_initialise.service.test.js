// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import InvoiceHelper from '../support/helpers/invoice.helper.js'

// Thing under test
import InvoiceRebillingInitialiseService from '../../app/services/invoice_rebilling_initialise.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
})
