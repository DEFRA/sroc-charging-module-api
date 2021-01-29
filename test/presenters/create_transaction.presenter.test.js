'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { CreateTransactionPresenter } = require('../../app/presenters')

describe('Create Transaction presenter', () => {
  it('correctly presents the data', () => {
    // Format and content of the test data does not have to accurately reflect a transaction. The key thing is the
    // presenter can pull what it needs from it
    const data = {
      region: 'A',
      regimeId: GeneralHelper.uuid4(),
      createdBy: GeneralHelper.uuid4(),
      status: 'initialised',
      id: GeneralHelper.uuid4()
    }

    const presenter = new CreateTransactionPresenter(data)
    const result = presenter.go()

    expect(result.transaction.id).to.equal(data.id)
    expect(result.transaction).to.have.length(1)
  })
})
