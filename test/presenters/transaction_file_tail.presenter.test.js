'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { TransactionFileTailPresenter } = require('../../app/presenters')

describe('Transaction File Tail Presenter', () => {
  const data = {
    index: 3,
    invoiceValue: 12345,
    creditNoteValue: 67890
  }

  it('returns the required columns', () => {
    const presenter = new TransactionFileTailPresenter(data)
    const result = presenter.go()

    // To avoid writing out col01...col05 we generate an array of them
    const expectedFields = []
    for (let fieldNumber = 1; fieldNumber <= 5; fieldNumber++) {
      const paddedNumber = fieldNumber.toString().padStart(2, '0')
      expectedFields.push(`col${paddedNumber}`)
    }

    expect(result).to.only.include(expectedFields)
  })

  it('returns the correct values', () => {
    const presenter = new TransactionFileTailPresenter(data)
    const result = presenter.go()

    expect(result.col01).to.equal('T')
    expect(result.col02).to.equal('0000003')
    expect(result.col03).to.equal(4)
    expect(result.col04).to.equal(data.invoiceValue)
    expect(result.col05).to.equal(-data.creditNoteValue)
  })
})
