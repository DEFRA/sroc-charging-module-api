'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GeneralHelper = require('../support/helpers/general.helper')

// Thing under test
const { ListCustomerFilesPresenter } = require('../../app/presenters')

describe('List Customer Files presenter', () => {
  it('correctly presents the data', () => {
    const data = [
      {
        id: GeneralHelper.uuid4(),
        fileReference: 'FILE1',
        status: 'initialised',
        exportedAt: null,
        exportedCustomers: [
          { customerReference: 'CUST11' }, { customerReference: 'CUST12' }, { customerReference: 'CUST13' }
        ]
      },
      {
        id: GeneralHelper.uuid4(),
        fileReference: 'FILE2',
        status: 'pending',
        exportedAt: null,
        exportedCustomers: [
          { customerReference: 'CUST21' }, { customerReference: 'CUST22' }, { customerReference: 'CUST23' }
        ]
      },
      {
        id: GeneralHelper.uuid4(),

        fileReference: 'FILE3',
        status: 'exported',
        exportedAt: '2021-01-12T14:41:10.511Z',
        exportedCustomers: [
          { customerReference: 'CUST31' }, { customerReference: 'CUST32' }, { customerReference: 'CUST33' }
        ]
      }
    ]

    const testPresenter = new ListCustomerFilesPresenter(data)
    const result = testPresenter.go()

    expect(result).to.have.length(3)
    expect(result[0]).to.equal({
      id: data[0].id,
      fileReference: data[0].fileReference,
      status: data[0].status,
      exportedAt: data[0].exportedAt,
      exportedCustomers: ['CUST11', 'CUST12', 'CUST13']
    })
    expect(result[1]).to.equal({
      id: data[1].id,
      fileReference: data[1].fileReference,
      status: data[1].status,
      exportedAt: data[1].exportedAt,
      exportedCustomers: ['CUST21', 'CUST22', 'CUST23']
    })
    expect(result[2]).to.equal({
      id: data[2].id,
      fileReference: data[2].fileReference,
      status: data[2].status,
      exportedAt: data[2].exportedAt,
      exportedCustomers: ['CUST31', 'CUST32', 'CUST33']
    })
  })
})
