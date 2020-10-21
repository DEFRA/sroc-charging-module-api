// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BasePresenter = require('../../app/presenters/base.presenter')

describe('Base translator', () => {
  afterEach(async () => {
    Sinon.restore()
  })

  it.only('presents data', async () => {
    // Stub _presentations to simulate a child class with presentation properties
    Sinon.stub(BasePresenter.prototype, '_presentations').returns({ before: 'after' })
    const testData = { before: true }

    const testPresenter = new BasePresenter(testData)
    console.log(testPresenter)
    expect(testPresenter.after).to.equal(true)
  })

  it('throws an error if translations are not specified', async () => {
    const testData = { before: true }

    expect(() => new BasePresenter(testData)).to.throw()
  })
})
