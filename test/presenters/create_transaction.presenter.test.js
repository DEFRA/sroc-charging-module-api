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
  describe('using the data passed in', () => {
    // Format and content of the test data does not have to accurately reflect a transaction. The key thing is the
    // presenter can pull what it needs from it
    const data = {
      region: 'A',
      regimeId: GeneralHelper.uuid4(),
      createdBy: GeneralHelper.uuid4(),
      status: 'initialised',
      clientId: 'HARDTARGET',
      id: GeneralHelper.uuid4()
    }

    it('correctly generates a response', () => {
      const presenter = new CreateTransactionPresenter(data)
      const result = presenter.go()

      expect(result.transaction).to.have.length(2)
      expect(result.transaction.id).to.equal(data.id)
      expect(result.transaction.clientId).to.equal(data.clientId)
    })

    describe("even if the 'clientId' is empty", () => {
      it('correctly generates a response', () => {
        data.clientId = ''
        const presenter = new CreateTransactionPresenter(data)
        const result = presenter.go()

        expect(result.transaction).to.have.length(2)
        expect(result.transaction.id).to.equal(data.id)
        expect(result.transaction.clientId).to.equal(data.clientId)
      })
    })
  })
})
