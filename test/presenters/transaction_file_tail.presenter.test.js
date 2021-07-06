// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import PresenterHelper from '../support/helpers/presenter.helper.js'

// Thing under test
import TransactionFileTailPresenter from '../../app/presenters/transaction_file_tail.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Transaction File Tail Presenter', () => {
  const data = {
    index: 3,
    invoiceValue: 12345,
    creditNoteValue: 67890
  }

  it('returns the required columns', () => {
    const presenter = new TransactionFileTailPresenter(data)
    const result = presenter.go()

    const expectedFields = PresenterHelper.generateNumberedColumns(5)

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
