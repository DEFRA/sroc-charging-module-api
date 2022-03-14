'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const PresenterHelper = require('../support/helpers/presenter.helper')

// Thing under test
const { TableFilePresenter } = require('../../app/presenters')

describe('Table Body Presenter', () => {
  const data = {
    firstColumn: 'FIRST_COLUMN',
    secondColumn: 'SECOND_COLUMN',
    thirdColumn: 'THIRD_COLUMN',
    fourthColumn: 'FOURTH_COLUMN',
    fifthColumn: 'FIFTH_COLUMN'
  }

  it('returns the required columns', () => {
    const presenter = new TableFilePresenter(data)
    const result = presenter.go()

    const expectedFields = PresenterHelper.generateNumberedColumns(5)

    expect(result).to.only.include(expectedFields)
  })

  it('returns the correct values for each field', () => {
    const presenter = new TableFilePresenter(data)
    const result = presenter.go()

    expect(result.col01).to.equal(data.firstColumn)
    expect(result.col02).to.equal(data.secondColumn)
    expect(result.col03).to.equal(data.thirdColumn)
    expect(result.col04).to.equal(data.fourthColumn)
    expect(result.col05).to.equal(data.fifthColumn)
  })
})
