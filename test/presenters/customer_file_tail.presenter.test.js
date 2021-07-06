// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import PresenterHelper from '../support/helpers/presenter.helper.js'

// Thing under test
import CustomerFileTailPresenter from '../../app/presenters/customer_file_tail.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
