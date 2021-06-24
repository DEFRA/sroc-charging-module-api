// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { JsonPresenter } = require('../../app/presenters')

describe('Json Presenter', () => {
  it('returns whatever you pass in', () => {
    const data = {
      reference: 'BESESAME001',
      customerName: 'Bert & Ernie Ltd'
    }

    const presenter = new JsonPresenter(data)

    expect(presenter.go()).to.equal(data)
  })
})
