// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import PresenterHelper from '../support/helpers/presenter.helper.js'

// Additional dependencies needed
import BasePresenter from '../../app/presenters/base.presenter.js'

// Thing under test
import TransactionFileHeadPresenter from '../../app/presenters/transaction_file_head.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
})
