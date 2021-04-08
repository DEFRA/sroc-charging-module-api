'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const { BasePresenter } = require('../../app/presenters')

const { PresenterHelper } = require('../support/helpers')

// Thing under test
const { CustomerFileHeadPresenter } = require('../../app/presenters')

describe('Customer File Head presenter', () => {
  const data = {
    index: 0,
    region: 'A',
    fileReference: 'nalrc50003'
  }

  it('returns the required columns', () => {
    const testPresenter = new CustomerFileHeadPresenter(data)
    const result = testPresenter.go()

    const expectedFields = PresenterHelper.generateNumberedCols(7)

    expect(result).to.only.include(expectedFields)
  })

  it('correctly presents the data', () => {
    const testPresenter = new CustomerFileHeadPresenter(data)
    const result = testPresenter.go()

    const basePresenter = new BasePresenter()
    const date = basePresenter._formatDate(new Date())

    expect(result.col01).to.equal('H')
    expect(result.col02).to.equal('0000000')
    expect(result.col03).to.equal('NAL')
    expect(result.col04).to.equal(data.region)
    expect(result.col05).to.equal('C')
    expect(result.col06).to.equal('50003')
    expect(result.col07).to.equal(date)
  })
})
