'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const BasePresenter = require('../../app/presenters/base.presenter.js')

const PresenterHelper = require('../support/helpers/presenter.helper.js')

// Thing under test
const TransactionFileHeadPresenter = require('../../app/presenters/transaction_file_head.presenter.js')

describe('Transaction File Head presenter', () => {
  const data = {
    index: 0,
    region: 'A',
    fileReference: 'nalri50003',
    billRunNumber: 10004,
    billRunUpdatedAt: '2021-01-12T14:41:10.511Z'
  }

  it('returns the required columns', () => {
    const testPresenter = new TransactionFileHeadPresenter(data)
    const result = testPresenter.go()

    const expectedFields = PresenterHelper.generateNumberedColumns(8)

    expect(result).to.only.include(expectedFields)
  })

  it('correctly presents the data', () => {
    const testPresenter = new TransactionFileHeadPresenter(data)
    const result = testPresenter.go()

    const basePresenter = new BasePresenter()
    const date = basePresenter._formatDate(new Date())

    expect(result.col01).to.equal('H')
    expect(result.col02).to.equal('0000000')
    expect(result.col03).to.equal('NAL')
    expect(result.col04).to.equal(data.region)
    expect(result.col05).to.equal('I')
    expect(result.col06).to.equal('50003')
    expect(result.col07).to.equal(data.billRunNumber)
    expect(result.col08).to.equal(date)
  })

  it('correctly presents an sroc file reference', () => {
    const testPresenter = new TransactionFileHeadPresenter({
      ...data,
      fileReference: 'nalri50003t'
    })
    const result = testPresenter.go()

    expect(result.col06).to.equal('50003T')
  })
})
