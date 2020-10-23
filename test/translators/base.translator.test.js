'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { BaseTranslator } = require('../../app/translators')

describe('Base translator', () => {
  afterEach(async () => {
    Sinon.restore()
  })

  it('translates and exposes data', async () => {
    // Stub _translations to simulate a child class with translations
    Sinon.stub(BaseTranslator.prototype, '_translations').returns({ before: 'after' })
    const testData = { before: true }

    const testTranslator = new BaseTranslator(testData)

    expect(testTranslator.after).to.equal(true)
  })

  it('throws an error if translations are not specified', async () => {
    const testData = { before: true }

    expect(() => new BaseTranslator(testData)).to.throw()
  })
})
