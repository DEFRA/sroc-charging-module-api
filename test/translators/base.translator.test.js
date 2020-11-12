'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

const Joi = require('joi')

// Thing under test
const { BaseTranslator } = require('../../app/translators')

let translationsStub
let schemaStub

describe('Base translator', () => {
  beforeEach(async () => {
    translationsStub = Sinon.stub(BaseTranslator.prototype, '_translations').returns({ before: 'after' })
    schemaStub = Sinon.stub(BaseTranslator.prototype, '_schema').returns(Joi.object({ before: Joi.boolean() }))
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('validation', () => {
    it('succeeds if data is valid', async () => {
      const testData = { before: true }

      expect(() => new BaseTranslator(testData)).to.not.throw()
    })

    it('throws an errror if data is invalid', async () => {
      const testData = { before: 'INVALID_DATA' }

      expect(() => new BaseTranslator(testData)).to.throw(Joi.ValidationError)
    })

    it('throws an errror if schema is not specified', async () => {
      schemaStub.restore()
      const testData = { before: true }

      expect(() => new BaseTranslator(testData)).to.throw()
    })
  })

  describe('translation', () => {
    it('correctly exposes data', async () => {
      const testData = { before: true }

      const testTranslator = new BaseTranslator(testData)

      expect(testTranslator.after).to.equal(true)
    })

    it('throws an error if translations are not specified', async () => {
      translationsStub.restore()
      const testData = { before: true }

      expect(() => new BaseTranslator(testData)).to.throw()
    })
  })
})
