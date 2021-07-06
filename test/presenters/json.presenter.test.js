// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Thing under test
import JsonPresenter from '../../app/presenters/json.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
