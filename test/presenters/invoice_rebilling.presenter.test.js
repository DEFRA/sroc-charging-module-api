'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GeneralHelper = require('../support/helpers/general.helper.js')

// Thing under test
const InvoiceRebillingPresenter = require('../../app/presenters/invoice_rebilling.presenter.js')

describe('Invoice Rebilling presenter', () => {
  it('correctly presents the data', () => {
    const data = [
      { id: GeneralHelper.uuid4(), rebilledType: 'C' },
      { id: GeneralHelper.uuid4(), rebilledType: 'R' }
    ]

    const testPresenter = new InvoiceRebillingPresenter(data)
    const { invoices } = testPresenter.go()

    expect(invoices).to.have.length(2)
    expect(invoices[0].id).to.equal(data[0].id)
    expect(invoices[0].rebilledType).to.equal(data[0].rebilledType)
    expect(invoices[1].id).to.equal(data[1].id)
    expect(invoices[1].rebilledType).to.equal(data[1].rebilledType)
  })
})
