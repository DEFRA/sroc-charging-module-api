'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  AuthorisedSystemHelper,
  BillRunHelper,
  DatabaseHelper,
  RegimeHelper,
  InvoiceHelper
} = require('../support/helpers')

// Thing under test
const { InvoiceRebillingCreateLicenceService } = require('../../app/services')

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
