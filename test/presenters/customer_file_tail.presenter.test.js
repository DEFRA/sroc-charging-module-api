'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const PresenterHelper = require('../support/helpers/presenter.helper')

// Thing under test
const { CustomerFileTailPresenter } = require('../../app/presenters')

describe('Customer File Tail Presenter', () => {
  const data = {
    index: 3
  }

  it('returns the required columns', () => {
    const presenter = new CustomerFileTailPresenter(data)
    const result = presenter.go()

    const expectedFields = PresenterHelper.generateNumberedColumns(3)

    expect(result).to.only.include(expectedFields)
  })

  it('returns the correct values', () => {
    const presenter = new CustomerFileTailPresenter(data)
    const result = presenter.go()

    expect(result.col01).to.equal('T')
    expect(result.col02).to.equal('0000003')
    expect(result.col03).to.equal(4)
  })
})
