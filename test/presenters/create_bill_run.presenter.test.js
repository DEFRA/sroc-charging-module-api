'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { CreateBillRunPresenter } = require('../../app/presenters')

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
