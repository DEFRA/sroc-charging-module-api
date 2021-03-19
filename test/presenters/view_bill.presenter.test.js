'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { ViewBillRunPresenter } = require('../../app/presenters')

describe('View Bill Run Presenter', () => {
  const data = {
    id: GeneralHelper.uuid4(),
    region: 'A',
    status: 'approved',
    billRunNumber: 10010,
    creditNoteCount: 0,
    creditNoteValue: 0,
    invoiceCount: 1,
    invoiceValue: 2093,
    netTotal: 2093,
    transactionFileReference: null,
    invoices: [
      {
        id: GeneralHelper.uuid4(),
        customerReference: 'CUSTOMER_REFERENCE',
        financialYear: 2018,
        creditLineCount: 0,
        creditLineValue: 0,
        debitLineCount: 1,
        debitLineValue: 2093,
        zeroLineCount: 0,
        deminimisInvoice: false,
        zeroValueInvoice: false,
        minimumChargeInvoice: false,
        transactionReference: null,
        netTotal: 2093,
        licences: [
          {
            id: GeneralHelper.uuid4(),
            licenceNumber: 'LICENCE_NUMBER'
          }
        ]
      }
    ]
  }

  it("returns the 'bill run' details", () => {
    const presenter = new ViewBillRunPresenter(data)
    const result = presenter.go()

    expect(result.billRun).to.include([
      'id',
      'billRunNumber',
      'region',
      'status',
      'creditNoteCount',
      'creditNoteValue',
      'invoiceCount',
      'invoiceValue',
      'netTotal',
      'transactionFileReference'
    ])
  })

  it("returns the 'invoices' linked to the 'bill run'", () => {
    const presenter = new ViewBillRunPresenter(data)
    const result = presenter.go()

    expect(result.billRun.invoices).to.be.an.array()
    expect(result.billRun.invoices[0]).to.include([
      'id',
      'customerReference',
      'financialYear',
      'deminimisInvoice',
      'zeroValueInvoice',
      'minimumChargeInvoice',
      'transactionReference',
      'netTotal'
    ])
  })

  it("returns the 'licences' linked to the 'invoices' linked to the 'bill run", () => {
    const presenter = new ViewBillRunPresenter(data)
    const result = presenter.go()

    expect(result.billRun.invoices[0].licences).to.be.an.array()
    expect(result.billRun.invoices[0].licences[0]).to.include([
      'id',
      'licenceNumber'
    ])
  })
})
