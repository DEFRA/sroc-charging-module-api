// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import InvoiceHelper from '../support/helpers/invoice.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Thing under test
import InvoiceRebillingCreateLicenceService from '../../app/services/invoice_rebilling_create_licence.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Invoice Rebilling Create Licence service', () => {
  let billRun
  let authorisedSystem
  let regime
  let invoice
  let result

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
    billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    invoice = await InvoiceHelper.addInvoice(billRun.id, 'TH230000222', 2021)

    result = await InvoiceRebillingCreateLicenceService.go(invoice, 'LICENCE123')
  })

  describe('a licence is created', () => {
    it('on the correct bill run and invoice', async () => {
      expect(result.billRunId).to.equal(billRun.id)
      expect(result.invoiceId).to.equal(invoice.id)
    })

    it('with the correct licence number', async () => {
      expect(result.licenceNumber).to.equal('LICENCE123')
    })
  })
})
