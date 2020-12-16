'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { CreateBillRunPresenter } = require('../../app/presenters')

describe('Create Bill Run presenter', () => {
  it('correctly presents the data', () => {
    const data = {
      billRunNumber: 10001,
      region: 'A',
      regimeId: 'ff75f82d-d56f-4807-9cad-12f23d6b29a8',
      createdBy: 'e46b816a-3fe8-438a-a3f9-7a1a8eb525ce',
      status: 'initialised',
      id: 'e2a28efc-09eb-439e-95bc-e64c68ab1ea5'
    }

    const testPresenter = new CreateBillRunPresenter(data)
    const result = testPresenter.go()
    const { billRun } = result

    expect(billRun.id).to.equal(data.id)
    expect(billRun.billRunNumber).to.equal(data.billRunNumber)
    expect(billRun).to.have.length(2)
  })
})
