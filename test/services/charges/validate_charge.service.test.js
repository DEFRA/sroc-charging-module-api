'use strict'
// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const { CalculatePresrocChargeTranslator, CalculateSrocChargeTranslator } = require('../../../app/translators')

// Thing under test
const { ValidateChargeService } = require('../../../app/services')

describe('Validate Charge service', () => {
  let translateStub

  beforeEach(async () => {
    translateStub = Sinon.stub(ValidateChargeService, '_translateRequest').returns({ success: true })
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When the request is for sroc', () => {
    it('calls CalculateSrocChargeTranslator', async () => {
      await ValidateChargeService.go({ ruleset: 'sroc' })

      expect(translateStub.calledWith(CalculateSrocChargeTranslator)).to.be.true()
    })
  })

  describe('When the request is for presroc', () => {
    it('calls CalculatePresrocChargeTranslator', async () => {
      await ValidateChargeService.go({ ruleset: 'presroc' })

      expect(translateStub.calledWith(CalculatePresrocChargeTranslator)).to.be.true()
    })
  })

  describe('When a valid ruleset is given', () => {
    it('returns the passed-in data', async () => {
      const result = await ValidateChargeService.go({ ruleset: 'sroc' })

      expect(result.success).to.exist()
      expect(result.success).to.be.true()
    })
  })

  describe('When an invalid ruleset is given', () => {
    describe('because the ruleset is missing', () => {
      it('throws an error', async () => {
        const err = await expect(ValidateChargeService.go({ invalid: true })).to.reject()

        expect(err).to.be.an.error()
      })
    })

    describe("because the ruleset isn't `sroc` or `presroc`", () => {
      it('throws an error', async () => {
        const err = await expect(ValidateChargeService.go({ ruleset: 'INVALID' })).to.reject()

        expect(err).to.be.an.error()
      })
    })
  })
})
