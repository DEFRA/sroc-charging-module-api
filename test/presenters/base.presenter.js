// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BasePresenter = require('../../app/presenters/base.presenter')

describe('Base presenter', () => {
  afterEach(async () => {
    Sinon.restore()
  })

  it('presents data', async () => {
    // Stub _presentation to simulate a child class with presentation properties
    Sinon.stub(BasePresenter.prototype, '_presentation').callsFake((data) => {
      return { after: data.before }
    })

    const testData = { before: true }
    const testPresenter = new BasePresenter(testData)
    const presentation = testPresenter.call()

    expect(presentation.after).to.equal(true)
  })

  it('throws an error if _presentation is not specified', async () => {
    const testData = { before: true }
    const testPresenter = new BasePresenter(testData)

    expect(() => testPresenter.call()).to.throw('You need to specify _presentation in the child presenter')
  })
})
