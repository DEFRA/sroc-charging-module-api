'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { CreateTransactionPresenter } = require('../../app/presenters')

describe.only('Create Transaction presenter', () => {
  it('correctly presents the data', () => {
    // Format and content of the test data does not have to accurately reflect a transaction. The key thing is the
    // presenter can pull what it needs from it
    const data = {
      region: 'A',
      regimeId: 'ff75f82d-d56f-4807-9cad-12f23d6b29a8',
      createdBy: 'e46b816a-3fe8-438a-a3f9-7a1a8eb525ce',
      status: 'initialised',
      id: 'e2a28efc-09eb-439e-95bc-e64c68ab1ea5'
    }

    const presenter = new CreateTransactionPresenter(data)
    const result = presenter.go()

    expect(result.transaction.id).to.equal(data.id)
    expect(result.transaction).to.have.length(1)
  })
})
