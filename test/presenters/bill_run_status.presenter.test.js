// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import GeneralHelper from '../support/helpers/general.helper.js'

// Thing under test
import BillRunStatusPresenter from '../../app/presenters/bill_run_status.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
