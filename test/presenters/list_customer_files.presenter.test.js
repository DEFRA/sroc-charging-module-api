'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { ListCustomerFilesPresenter } = require('../../app/presenters')

describe('List Customer Files presenter', () => {
  it('correctly presents the data', () => {
    const data = [
      {
        fileReference: 'FILE1',
        exportedCustomers: [
          { customerReference: 'CUST11' }, { customerReference: 'CUST12' }, { customerReference: 'CUST13' }
        ]
      },
      {
        fileReference: 'FILE2',
        exportedCustomers: [
          { customerReference: 'CUST21' }, { customerReference: 'CUST22' }, { customerReference: 'CUST23' }
        ]
      },
      {
        fileReference: 'FILE3',
        exportedCustomers: [
          { customerReference: 'CUST31' }, { customerReference: 'CUST32' }, { customerReference: 'CUST33' }
        ]
      }
    ]

    const testPresenter = new ListCustomerFilesPresenter(data)
    const result = testPresenter.go()

    expect(result).to.have.length(3)
    expect(result[0]).to.equal({
      fileReference: 'FILE1',
      exportedCustomers: ['CUST11', 'CUST12', 'CUST13']
    })
    expect(result[1]).to.equal({
      fileReference: 'FILE2',
      exportedCustomers: ['CUST21', 'CUST22', 'CUST23']
    })
    expect(result[2]).to.equal({
      fileReference: 'FILE3',
      exportedCustomers: ['CUST31', 'CUST32', 'CUST33']
    })
  })
})
