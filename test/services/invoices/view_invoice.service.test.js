'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const NewTransactionHelper = require('../../support/helpers/new_transaction.helper')

const BillRunModel = require('../../../app/models/bill_run.model.js')
const InvoiceModel = require('../../../app/models/invoice.model.js')

// Things we need to stub
const ValidateInvoiceService = require('../../../app/services/invoices/validate_invoice.service')

// Thing under test
const ViewInvoiceService = require('../../../app/services/invoices/view_invoice.service.js')

describe('View Invoice service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
    Sinon.stub(ValidateInvoiceService, 'go')
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When a valid bill run and invoice are supplied', () => {
    let billRun
    let invoice

    beforeEach(async () => {
      const transaction = await NewTransactionHelper.create()
      invoice = await InvoiceModel.query().findById(transaction.invoiceId)
      billRun = await BillRunModel.query().findById(transaction.billRunId)
    })

    it('returns the expected response', async () => {
      const result = await ViewInvoiceService.go(billRun, invoice)

      expect(result.invoice.id).to.equal(invoice.id)
      expect(result.invoice.netTotal).to.equal(772)
      expect(result.invoice.ruleset).to.equal('presroc')

      expect(result.invoice.licences).to.be.an.array()
      expect(result.invoice.licences[0].transactions).to.be.an.array()
      expect(result.invoice.licences[0].netTotal).to.equal(772)
    })
  })
})
