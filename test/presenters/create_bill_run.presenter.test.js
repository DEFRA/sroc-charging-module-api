// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import GeneralHelper from '../support/helpers/general.helper'

// Thing under test
import CreateBillRunPresenter from '../../app/presenters/create_bill_run.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Create Bill Run presenter', () => {
  it('correctly presents the data', () => {
    const data = {
      billRunNumber: 10001,
      region: 'A',
      regimeId: GeneralHelper.uuid4(),
      createdBy: GeneralHelper.uuid4(),
      status: 'initialised',
      id: GeneralHelper.uuid4()
    }

    const testPresenter = new CreateBillRunPresenter(data)
    const result = testPresenter.go()
    const { billRun } = result

    expect(billRun.id).to.equal(data.id)
    expect(billRun.billRunNumber).to.equal(data.billRunNumber)
    expect(billRun).to.have.length(2)
  })
})
