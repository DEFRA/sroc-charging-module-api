// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { BillRunStatusPresenter } = require('../../app/presenters')

describe('Bill run status Presenter', () => {
  it("returns the 'status' of the bill run", () => {
    const data = {
      id: GeneralHelper.uuid4(),
      region: 'A',
      bill_run_number: 100001,
      status: 'intialised'
    }

    const presenter = new BillRunStatusPresenter(data)

    expect(presenter.go()).to.equal({
      status: data.status
    })
  })
})
