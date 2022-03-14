'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const PresenterHelper = require('../support/helpers/presenter.helper')

// Thing under test
const CustomerFileBodyPresenter = require('../../app/presenters/customer_file_body.presenter')

describe('Customer File Body Presenter', () => {
  const data = {
    index: 1,
    customerReference: 'CUSTOMER_REF',
    customerName: 'CUSTOMER_NAME',
    addressLine1: 'ADDRESS_LINE_1',
    addressLine2: 'ADDRESS_LINE_2',
    addressLine3: 'ADDRESS_LINE_3',
    addressLine4: 'ADDRESS_LINE_4',
    addressLine5: 'ADDRESS_LINE_5',
    addressLine6: 'ADDRESS_LINE_6',
    postcode: 'POSTCODE'
  }

  it('returns the required columns', () => {
    const presenter = new CustomerFileBodyPresenter(data)
    const result = presenter.go()

    const expectedFields = PresenterHelper.generateNumberedColumns(11)

    expect(result).to.only.include(expectedFields)
  })

  it('returns the correct values for each field', () => {
    const presenter = new CustomerFileBodyPresenter(data)
    const result = presenter.go()

    expect(result.col01).to.equal('D')
    expect(result.col02).to.equal('0000001')
    expect(result.col03).to.equal(data.customerReference)
    expect(result.col04).to.equal(data.customerName)
    expect(result.col05).to.equal(data.addressLine1)
    expect(result.col06).to.equal(data.addressLine2)
    expect(result.col07).to.equal(data.addressLine3)
    expect(result.col08).to.equal(data.addressLine4)
    expect(result.col09).to.equal(data.addressLine5)
    expect(result.col10).to.equal(data.addressLine6)
    expect(result.col11).to.equal(data.postcode)
  })
})
