'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../helpers/database.helper')
const BillRunModel = require('../../../../app/models/bill_run.model')
const InvoiceModel = require('../../../../app/models/invoice.model')
const LicenceModel = require('../../../../app/models/licence.model')

// Thing under test
const NewTransactionHelper = require('../../helpers/new_transaction.helper')

describe('New Transaction helper', () => {
  let transaction

  beforeEach(async () => {
    await DatabaseHelper.clean()

    transaction = await NewTransactionHelper.create()
  })

  describe('#create method', () => {
    it('updates the parent licence', async () => {
      const result = await LicenceModel.query().findById(transaction.licenceId)

      expect(result.debitLineCount).to.equal(1)
      expect(result.debitLineValue).to.equal(transaction.chargeValue)
    })

    it('updates values at the invoice and bill run level', async () => {
      const invoice = await InvoiceModel.query().findById(transaction.invoiceId)
      const billRun = await BillRunModel.query().findById(transaction.billRunId)

      expect(invoice.debitLineCount).to.equal(1)
      expect(invoice.debitLineValue).to.equal(transaction.chargeValue)
      expect(billRun.debitLineCount).to.equal(1)
      expect(billRun.debitLineValue).to.equal(transaction.chargeValue)
    })
  })
})
